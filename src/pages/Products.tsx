import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Package, Plus, Search, Pencil, Trash2, AlertCircle } from 'lucide-react';
import DeleteConfirmation from '../components/DeleteConfirmation';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  description?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    minStock: '5',
    description: ''
  });

  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/products');
      setProducts(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        stock: '',
        minStock: '5',
        description: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/products/${productToDelete}`, { method: 'DELETE' });
      toast.success("Produto excluído");
      setIsDeleteDialogOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock)
    };

    try {
      if (editingProduct) {
        await apiFetch(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success("Produto atualizado");
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success("Produto criado");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Filtrar por nome..." 
            className="pl-9 h-9 text-xs border-slate-200 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-4" onClick={() => handleOpenDialog()}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Novo Produto
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Produto</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Valor (R$)</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Estoque</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Status</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <TableCell className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 rounded border border-slate-200">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{product.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{product.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2.5 text-xs font-bold text-slate-700 tracking-tight">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{product.stock} un</span>
                    {product.stock <= product.minStock && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-bold uppercase tracking-tighter">
                        Repor
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  {product.stock > 0 ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] rounded border border-emerald-100 font-bold uppercase tracking-tighter">Em Linha</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded border border-red-100 font-bold uppercase tracking-tighter">Esgotado</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-slate-100" onClick={() => handleOpenDialog(product)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteClick(product.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs italic">
                  Nenhum registro encontrado na base de dados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px] border-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wide text-slate-600 border-l-4 border-indigo-600 pl-3">
              {editingProduct ? 'Editar' : 'Cadastrar'} Produto
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase">Identificação do Item</Label>
              <Input 
                id="name" 
                className="h-9 text-xs border-slate-200"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-[10px] font-bold text-slate-500 uppercase">Preço Unit. (R$)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  className="h-9 text-xs border-slate-200"
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-[10px] font-bold text-slate-500 uppercase">Qtd em Estoque</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  className="h-9 text-xs border-slate-200"
                  value={formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minStock" className="text-[10px] font-bold text-slate-500 uppercase">Limite de Alerta (Min)</Label>
                <Input 
                  id="minStock" 
                  type="number" 
                  className="h-9 text-xs border-slate-200"
                  value={formData.minStock} 
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  required 
                />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[10px] font-bold text-slate-500 uppercase">Notas Técnicas / Descrição</Label>
              <Input 
                id="description" 
                className="h-9 text-xs border-slate-200"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="h-9 text-xs font-bold" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-6">Salvar Registro</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
