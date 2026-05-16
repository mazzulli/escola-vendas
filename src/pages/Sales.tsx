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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Receipt, Calendar, Trash2, FileDown, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  startOfDay, 
  endOfDay, 
  isWithinInterval, 
  parseISO 
} from 'date-fns';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Sale {
  id: string;
  productId: string;
  product: { name: string; price: number };
  quantity: number;
  total: number;
  paymentMethod: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    try {
      const [salesData, productsData] = await Promise.all([
        apiFetch('/sales'),
        apiFetch('/products')
      ]);
      setSales(salesData);
      setProducts(productsData.filter((p: Product) => p.stock > 0));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return toast.error("Selecione um produto");
    
    setIsLoading(true);
    try {
      await apiFetch('/sales', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProductId,
          quantity: parseInt(quantity),
          paymentMethod,
          date: saleDate
        }),
      });
      toast.success("Venda registrada com sucesso!");
      setIsDialogOpen(false);
      setSelectedProductId('');
      setPaymentMethod('');
      setQuantity('1');
      setSaleDate(format(new Date(), 'yyyy-MM-dd'));
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/sales/${itemToDelete}`, { method: 'DELETE' });
      toast.success("Venda excluída e estoque restaurado");
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const getPaymentLabel = (method: string) => {
    switch(method) {
      case 'MONEY': return { label: 'Dinheiro', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      case 'DEBIT': return { label: 'Débito', color: 'text-blue-600 bg-blue-50 border-blue-100' };
      case 'CREDIT': return { label: 'Crédito', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
      case 'PIX': return { label: 'Pix', color: 'text-purple-600 bg-purple-50 border-purple-100' };
      default: return { label: method, color: 'text-slate-600 bg-slate-50 border-slate-100' };
    }
  };

  const filteredSales = sales.filter(sale => {
    // Search filter
    if (searchTerm && !sale.product?.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (!startDate && !endDate) return true;
    
    const saleDate = parseISO(sale.date);
    const start = startDate ? startOfDay(parseISO(startDate)) : null;
    const end = endDate ? endOfDay(parseISO(endDate)) : null;

    if (start && end) {
      return isWithinInterval(saleDate, { start, end });
    } else if (start) {
      return saleDate >= start;
    } else if (end) {
      return saleDate <= end;
    }
    return true;
  });

  const exportToExcel = () => {
    if (filteredSales.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const dataToExport = filteredSales.map(sale => ({
      ID: sale.id,
      Data: format(new Date(sale.date), "dd/MM/yyyy HH:mm"),
      Produto: sale.product?.name || 'N/A',
      Quantidade: sale.quantity,
      Pagamento: getPaymentLabel(sale.paymentMethod).label,
      Total: sale.total
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");

    // Fix column widths
    const maxWidths = [
      { wch: 15 }, // ID
      { wch: 20 }, // Data
      { wch: 30 }, // Produto
      { wch: 12 }, // Quantidade
      { wch: 15 }, // Pagamento
      { wch: 12 }, // Total
    ];
    worksheet['!cols'] = maxWidths;

    XLSX.writeFile(workbook, `vendas_export_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
    toast.success("Arquivo Excel gerado com sucesso!");
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Histórico de Transações</h3>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight">Relatório financeiro de vendas diretas no PDV</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" className="h-9 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={exportToExcel} disabled={filteredSales.length === 0}>
            <FileDown className="w-3.5 h-3.5 mr-1.5" />
            Exportar Excel
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-4 flex-grow sm:flex-grow-0" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Registrar Venda
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">Pesquisar Produto</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Nome do item..." 
              className="h-9 text-xs pl-9 border-slate-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">Data Inicial</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input 
              type="date" 
              className="h-9 text-xs pl-9 border-slate-200" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">Data Final</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input 
              type="date" 
              className="h-9 text-xs pl-9 border-slate-200" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-between items-center h-9">
          <Button 
            variant="ghost" 
            className="h-9 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600 px-2"
            onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
          >
            Limpar
          </Button>
          <div className="text-right">
             <span className="text-[10px] font-bold text-slate-400 uppercase">Total: <span className="text-indigo-600">{filteredSales.length}</span></span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Data / Hora</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Item</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Qtd</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Pagamento</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Total Bruto</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow key={sale.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <TableCell className="px-4 py-2.5 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {format(new Date(sale.date), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2.5 text-xs font-bold text-slate-800">
                  {sale.product?.name}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-xs text-slate-600">
                  {sale.quantity} und
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${getPaymentLabel(sale.paymentMethod).color}`}>
                    {getPaymentLabel(sale.paymentMethod).label}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-2.5 text-xs font-bold text-emerald-600 tracking-tight">
                  {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 outline-1 outline-indigo-100">
                      <Receipt className="w-3 h-3 mr-1" />
                      Comprovante
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteClick(sale.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredSales.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-xs italic">
                  Nenhuma transação financeira encontrada nos critérios selecionados.
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
              Nova Venda Direta
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSale} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Item a Vender</Label>
              <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                <SelectTrigger className="h-10 text-xs border-slate-200">
                  <SelectValue placeholder="Escolha um produto disponível...">
                    {selectedProduct?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} • (Estoque: {p.stock} un)
                    </SelectItem>
                  ))}
                  {products.length === 0 && (
                    <div className="p-3 text-[11px] text-slate-400 text-center italic">
                      Nenhum item disponível em estoque.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Data do Pagamento / Venda</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  type="date" 
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="h-10 text-xs pl-9 border-slate-200" 
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Quantidade</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max={selectedProduct?.stock || 1}
                  className="h-10 text-xs border-slate-200"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Pagamento</Label>
                <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                  <SelectTrigger className="h-10 text-xs border-slate-200">
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONEY" className="text-xs">Dinheiro</SelectItem>
                    <SelectItem value="DEBIT" className="text-xs">Débito</SelectItem>
                    <SelectItem value="CREDIT" className="text-xs">Crédito</SelectItem>
                    <SelectItem value="PIX" className="text-xs">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedProduct && paymentMethod && (
              <div className="bg-slate-900 p-4 rounded-xl text-white flex justify-between items-center shadow-lg shadow-slate-200">
                <div>
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-tight">Valor Total do Recibo</p>
                  <p className="text-2xl font-bold tracking-tight">R$ {(selectedProduct.price * parseInt(quantity || '0')).toFixed(2)}</p>
                </div>
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="h-9 text-xs font-bold" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-6" 
                disabled={isLoading || !selectedProductId || !paymentMethod || parseInt(quantity) > (selectedProduct?.stock || 0)}
              >
                {isLoading ? 'Liquidando...' : 'Liquidizar Venda'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Estornar Venda"
        description="Essa operação irá excluir o registro da venda e devolver a quantidade vendida ao estoque do produto. Confirmar?"
      />
    </div>
  );
}
