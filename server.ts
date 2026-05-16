import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth: Request OTP
  app.post("/api/auth/request-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // In a real app, check if user exists.
    // Let's ensure user exists or create them if it's the first time
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const userCount = await prisma.user.count();
      user = await prisma.user.create({ 
        data: { 
          email,
          isAdmin: userCount === 0 // Primeiro usuário é Admin
        } 
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.oTP.create({
      data: { email, code: otpCode, expiresAt }
    });

    console.log(`OTP for ${email}: ${otpCode}`);

    // Mock sending email
    // if you have SMTP configured, you'd use nodemailer here.
    // For now, we'll return it in the response for easy testing in AI Studio
    // unless the user explicitly wants it to be perfectly secure.
    // I'll return it ONLY if process.env.NODE_ENV !== 'production'
    res.json({ 
      message: "OTP sent to your email", 
      otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined 
    });
  });

  // Auth: Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code are required" });

    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    
    // Promote user to admin if it's the target email or the only user
    if (user && !user.isAdmin && (email === 'mazzulli.danilo@gmail.com' || (await prisma.user.count()) === 1)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true }
      });
    }

    const token = jwt.sign(
      { id: user?.id, email: user?.email, isAdmin: user?.isAdmin }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Delete OTP after use
    await prisma.oTP.deleteMany({ where: { email } });

    res.json({ token, user });
  });

  // --- Users CRUD (Admin Only) ---
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
  };

  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  });

  app.post("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    const { email, name, isAdmin } = req.body;
    try {
      const user = await prisma.user.create({
        data: { email, name, isAdmin: !!isAdmin }
      });
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: "Usuário já existe ou dados inválidos" });
    }
  });

  app.put("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { email, name, isAdmin } = req.body;
    try {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { email, name, isAdmin: !!isAdmin }
      });
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      // Prevent deleting self
      if (req.params.id === (req as any).user.id) {
        return res.status(400).json({ error: "Você não pode excluir seu próprio usuário" });
      }
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ error: "Este usuário possui registros vinculados e não pode ser excluído." });
    }
  });

  // Products CRUD
  app.get("/api/products", authenticateToken, async (req, res) => {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(products);
  });

  app.post("/api/products", authenticateToken, async (req, res) => {
    const product = await prisma.product.create({
      data: req.body
    });
    res.json(product);
  });

  app.put("/api/products/:id", authenticateToken, async (req, res) => {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(product);
  });

  app.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      await prisma.product.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Este produto possui vendas ou reservas vinculadas e não pode ser excluído. Tente zerar o estoque em vez disso." });
    }
  });

  // Sales
  app.get("/api/sales", authenticateToken, async (req, res) => {
    const sales = await prisma.sale.findMany({
      include: { product: true, user: true },
      orderBy: { date: 'desc' }
    });
    res.json(sales);
  });

  app.post("/api/sales", authenticateToken, async (req, res) => {
    const { productId, quantity, paymentMethod, date } = req.body;
    if (!paymentMethod) return res.status(400).json({ error: "Tipo de pagamento é obrigatório" });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    
    if (!product || product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const total = product.price * quantity;
    
    const [sale] = await prisma.$transaction([
      prisma.sale.create({
        data: {
          productId,
          quantity,
          total,
          userId: (req as any).user.id,
          paymentMethod,
          date: date ? new Date(date) : new Date()
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } }
      })
    ]);

    res.json(sale);
  });

  app.delete("/api/sales/:id", authenticateToken, async (req, res) => {
    try {
      const sale = await prisma.sale.findUnique({ where: { id: req.params.id } });
      if (!sale) return res.status(404).json({ error: "Venda não encontrada" });

      await prisma.$transaction([
        prisma.sale.delete({ where: { id: req.params.id } }),
        prisma.product.update({
          where: { id: sale.productId },
          data: { stock: { increment: sale.quantity } }
        })
      ]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Erro ao excluir venda" });
    }
  });

  // Reservations
  app.get("/api/reservations", authenticateToken, async (req, res) => {
    const reservations = await prisma.reservation.findMany({
      include: { product: true },
      orderBy: { date: 'desc' }
    });
    res.json(reservations);
  });

  app.post("/api/reservations", authenticateToken, async (req, res) => {
    const reservation = await prisma.reservation.create({
      data: req.body
    });
    res.json(reservation);
  });

  app.delete("/api/reservations/:id", authenticateToken, async (req, res) => {
    try {
      await prisma.reservation.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Erro ao excluir reserva" });
    }
  });

  app.put("/api/reservations/:id", authenticateToken, async (req, res) => {
    const { status, paymentMethod, date } = req.body;
    const existing = await prisma.reservation.findUnique({ 
      where: { id: req.params.id },
      include: { product: true }
    });

    if (!existing) return res.status(404).json({ error: "Not found" });

    // Transition PENDING -> COMPLETED: Perform the sale
    if (existing.status === 'PENDING' && status === 'COMPLETED') {
      if (!paymentMethod) return res.status(400).json({ error: "Tipo de pagamento é obrigatório para concluir a encomenda" });

      const product = existing.product;
      if (product.stock < existing.quantity) {
        return res.status(400).json({ error: "Insufficient stock to fulfill reservation" });
      }

      await prisma.$transaction([
        prisma.sale.create({
          data: {
            productId: existing.productId,
            quantity: existing.quantity,
            total: product.price * existing.quantity,
            userId: (req as any).user.id,
            paymentMethod,
            date: date ? new Date(date) : new Date()
          }
        }),
        prisma.product.update({
          where: { id: existing.productId },
          data: { stock: { decrement: existing.quantity } }
        }),
        prisma.reservation.update({
          where: { id: req.params.id },
          data: { status }
        })
      ]);
    } else {
      await prisma.reservation.update({
        where: { id: req.params.id },
        data: { status }
      });
    }

    res.json({ success: true });
  });

  // Dashboard / Reports
  app.get("/api/dashboard", authenticateToken, async (req, res) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailySales, monthlySales, lowStockProducts, totalProducts] = await Promise.all([
      prisma.sale.aggregate({
        where: { date: { gte: todayStart } },
        _sum: { total: true },
        _count: true
      }),
      prisma.sale.aggregate({
        where: { date: { gte: monthStart } },
        _sum: { total: true }
      }),
      prisma.product.findMany({
        where: { stock: { lte: prisma.product.fields.minStock } }
      }),
      prisma.product.count()
    ]);

    res.json({
      dailyTotal: dailySales._sum.total || 0,
      dailyCount: dailySales._count || 0,
      monthlyTotal: monthlySales._sum.total || 0,
      lowStockCount: lowStockProducts.length,
      lowStockItems: lowStockProducts,
      totalProducts
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server", err);
});
