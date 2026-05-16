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
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { CalendarCheck, Plus, User, Phone, FileText, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Reservation {
  id: string;
  productId: string;
  product: { name: string; price: number; stock: number };
  quantity: number;
  customerName: string;
  customerDoc: string;
  customerPhone: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [completeDate, setCompleteDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    customerName: '',
    customerDoc: '',
    customerPhone: ''
  });

  const fetchData = async () => {
    try {
      const [resData, prodData] = await Promise.all([
        apiFetch('/reservations'),
        apiFetch('/products')
      ]);
      setReservations(resData);
      setProducts(prodData);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        }),
      });
      toast.success("Reserva cadastrada com sucesso!");
      setIsDialogOpen(false);
      setFormData({ productId: '', quantity: '1', customerName: '', customerDoc: '', customerPhone: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string ) => {
    try {
      // Atualizar o status da reserva
      await apiFetch(`/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, date: status === 'COMPLETED' ? completeDate : undefined }),
      });

      // Se a reserva foi concluída, atualizar o estoque somando a quantidade
      if (status === 'COMPLETED') {
        const reservation = reservations.find(res => res.id === id);
        if (reservation) {
          const currentProduct = products.find(p => p.id === reservation.productId);
          if (currentProduct) {
            const newStock = currentProduct.stock + reservation.quantity;
            await apiFetch(`/products/${reservation.productId}`, {
              method: 'PUT',
              body: JSON.stringify({ 
                name: currentProduct.name,
                price: currentProduct.price,
                stock: newStock 
              }),
            });
          }
        }
      }

      toast.success(`Reserva ${status === 'COMPLETED' ? 'concluída' : 'cancelada'}`);
      fetchData();
      setIsPaymentDialogOpen(false);
      setActiveReservationId(null);
      setSelectedPaymentMethod('');
      setCompleteDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onCompleteClick = (id: string) => {
    setActiveReservationId(id);
    setIsPaymentDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/reservations/${itemToDelete}`, { method: 'DELETE' });
      toast.success("Reserva excluída");
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  const statusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100">Pendente</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">Concluída</Badge>;
      case 'CANCELED': return <Badge variant="outline" className="bg-zinc-50 text-zinc-400 border-zinc-100">Cancelada</Badge>;
      default: return null;
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (statusFilter === 'ALL') return true;
    return res.status === statusFilter;
  });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight leading-none">Gestão de Encomendas</h3>
          <p className="text-[10px] text-slate-400 font-medium">Controle e monitoramento de pedidos antecipados</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-4" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nova Reserva
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs defaultValue="ALL" className="w-full sm:w-auto" onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-100/50 p-1 rounded-lg border border-slate-200/60 w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="ALL" className="text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
              Todas
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
              Concluídas
            </TabsTrigger>
            <TabsTrigger value="CANCELED" className="text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-500 data-[state=active]:shadow-sm">
              Canceladas
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          Total: <span className="text-indigo-600 ml-1">{filteredReservations.length}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table className="min-w-175">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Cliente / Data</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Item / Qtde</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Contato / Doc</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Status</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((res) => (
              <TableRow key={res.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <TableCell className="px-4 py-2.5">
                  <p className="text-xs font-bold text-slate-800">{res.customerName}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                    {format(new Date(res.date), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <p className="text-xs font-bold text-slate-700">{res.product?.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{res.quantity} unidades</p>
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <div className="flex flex-col text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {res.customerPhone}</span>
                    <span className="flex items-center gap-1"><FileText className="w-2.5 h-2.5" /> {res.customerDoc}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  {res.status === 'PENDING' ? (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] rounded border border-amber-100 font-bold uppercase tracking-widest animate-pulse">Pendente</span>
                  ) : res.status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] rounded border border-emerald-100 font-bold uppercase tracking-widest">Concluída</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] rounded border border-slate-200 font-bold uppercase tracking-widest">Cancelada</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    {res.status === 'PENDING' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-emerald-500 hover:bg-emerald-50"
                          onClick={() => onCompleteClick(res.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-400 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(res.id, 'CANCELED')}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteClick(res.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredReservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs italic">
                  Nenhuma reserva detectada no monitoramento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-100 border-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wide text-slate-600 border-l-4 border-indigo-600 pl-3">
              Cadastrar Reserva
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateReservation} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Item Solicitado</Label>
                <Select                   
                  onValueChange={(v) => setFormData({...formData, productId: v ? v : ''})} value={formData.productId}
                >
                  <SelectTrigger className="h-9 text-xs border-slate-200 w-full">
                    <SelectValue placeholder="Selecione o produto">
                      {selectedProduct?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">{p.name} (Saldo: {p.stock} un)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Quantidade</Label>
                <Input 
                  type="number" 
                  min="1" 
                  className="h-9 text-xs border-slate-200"
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">RG / CPF</Label>
                <Input 
                  placeholder="000.000.000-00" 
                  className="h-9 text-xs border-slate-200"
                  value={formData.customerDoc}
                  onChange={(e) => setFormData({...formData, customerDoc: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Depositante</Label>
              <Input 
                placeholder="Nome completo" 
                className="h-9 text-xs border-slate-200"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Canal de Contato</Label>
              <Input 
                placeholder="(00) 00000-0000" 
                className="h-9 text-xs border-slate-200"
                value={formData.customerPhone}
                onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="h-9 text-xs font-bold" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-6" disabled={isLoading}>
                 {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                {isLoading ? 'Confirmando...' : 'Efetivar Reserva'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-100 border-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wide text-emerald-600 border-l-4 border-emerald-600 pl-3">
              Concluir Encomenda
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-xs text-slate-500">Confirma a conclusão da encomenda e atualizar o saldo em estoque?</p>
            
            {/* <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Data e Hora da Conclusão</Label>
              <div className="relative">
                <CalendarCheck className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  type="datetime-local" 
                  max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  className="h-10 text-xs pl-9 border-slate-200" 
                  value={completeDate}
                  onChange={(e) => setCompleteDate(e.target.value)}
                  required
                />
              </div>
            </div> */}

            {/* <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Pagamento</Label>
              <Select onValueChange={(value) => setSelectedPaymentMethod(value || '')} value={selectedPaymentMethod}>
                <SelectTrigger className="h-10 text-xs border-slate-200">
                  <SelectValue placeholder="Selecione o método..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONEY" className="text-xs">Dinheiro</SelectItem>
                  <SelectItem value="DEBIT" className="text-xs">Débito</SelectItem>
                  <SelectItem value="CREDIT" className="text-xs">Crédito</SelectItem>
                  <SelectItem value="PIX" className="text-xs">Pix</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" className="h-9 text-xs font-bold" onClick={() => setIsPaymentDialogOpen(false)}>Fechar</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 h-9 text-xs font-bold px-6" 
              onClick={() => {
                if (activeReservationId) {
                  handleUpdateStatus(activeReservationId, 'COMPLETED');
                }
              }}
              // disabled={!selectedPaymentMethod || !activeReservationId}
            >
              Finalizar produção
            </Button>
          </DialogFooter>
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
