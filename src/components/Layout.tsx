import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CalendarCheck, 
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Início', icon: LayoutDashboard, path: '/' },
    { name: 'Produtos', icon: Package, path: '/products' },
    { name: 'Vendas', icon: ShoppingCart, path: '/sales' },
    { name: 'Encomendas', icon: CalendarCheck, path: '/reservations' },
    ...(user?.isAdmin ? [{ name: 'Usuários', icon: Users, path: '/users' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = navItems.find(item => item.path === location.pathname);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full bg-brand-surface font-sans text-slate-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-9 w-9 text-slate-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 shrink-0">
            E
          </div>
          <h1 className="font-bold text-base md:text-lg tracking-tight truncate max-w-[120px] md:max-w-none">
            Escola Vendas <span className="text-indigo-600">Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Sessão Ativa: {user?.email}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs font-semibold hover:bg-slate-100 h-8 px-2 md:px-3"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "absolute inset-y-0 left-0 w-64 bg-white border-r flex flex-col z-20 transition-transform duration-300 md:relative md:translate-x-0 md:z-10",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <section className="p-4 space-y-3 pb-6">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Navegação Principal</p>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 font-bold border-r-4 border-indigo-600" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </section>

          <section className="mt-auto border-t p-4 bg-slate-50/50">
            <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 shadow-lg shadow-slate-200">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-indigo-200">Sistema</p>
              <p className="text-[11px] leading-relaxed text-slate-300 truncate">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-[10px] font-mono text-emerald-300">Conectado</span>
              </div>
            </div>
          </section>
        </aside>

        {/* Central Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="h-10 md:h-12 border-b bg-white flex items-center px-4 md:px-6 gap-6 shrink-0 overflow-x-auto no-scrollbar">
            <span className="text-xs md:text-sm font-bold text-indigo-600 px-2 h-full flex items-center border-b-2 border-indigo-600 whitespace-nowrap">
              {currentPage?.name || 'Visão Geral'}
            </span>
            <div className="flex-1"></div>
            <div className="hidden sm:flex text-[10px] text-slate-400 items-center gap-2 pr-2 whitespace-nowrap">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              Sincronizado
            </div>
          </div>
          
          <div className="flex-1 p-3 md:p-6 overflow-y-auto scroll-smooth">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
