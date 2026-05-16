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
  DialogFooter
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Users as UsersIcon, Plus, Search, Pencil, Trash2, UserCog, Mail, ShieldCheck } from 'lucide-react';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    isAdmin: false
  });

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message);
      if (err.message.includes('403')) {
        navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        name: user.name || '',
        isAdmin: user.isAdmin
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        name: '',
        isAdmin: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiFetch(`/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success("Usuário atualizado com sucesso");
      } else {
        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success("Usuário cadastrado com sucesso");
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (id === currentUser?.id) {
      toast.error("Você não pode excluir seu próprio usuário");
      return;
    }
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/users/${itemToDelete}`, { method: 'DELETE' });
      toast.success("Usuário excluído");
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Filtrar por nome ou e-mail..." 
            className="pl-9 h-9 text-xs border-slate-200 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-4" onClick={() => handleOpenDialog()}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Novo Usuário
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Usuário</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">E-mail</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Permissão</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4">Cadastro</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider h-10 px-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <TableCell className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-50 rounded border border-indigo-100">
                      <UsersIcon className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{u.name || 'Sem nome'}</p>
                      {u.id === currentUser?.id && (
                        <span className="text-[9px] bg-slate-900 text-white px-1 py-0.5 rounded font-bold uppercase">Você</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2.5 text-xs text-slate-600 font-medium">
                  {u.email}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  {u.isAdmin ? (
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] font-bold uppercase tracking-tighter">Administrador</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-200 text-[10px] font-bold uppercase tracking-tighter">Operador</Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-slate-100" onClick={() => handleOpenDialog(u)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteClick(u.id)} disabled={u.id === currentUser?.id}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs italic">
                  Nenhum usuário encontrado.
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
              {editingUser ? 'Editar' : 'Cadastrar'} Usuário
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo</Label>
              <Input 
                id="name" 
                className="h-9 text-xs border-slate-200"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase">E-mail de Acesso</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  id="email" 
                  type="email"
                  className="pl-9 h-9 text-xs border-slate-200"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <Label htmlFor="isAdmin" className="text-[10px] font-bold text-slate-700 uppercase">Privilégios de Administrador</Label>
                </div>
                <p className="text-[10px] text-slate-400">Permite gerenciar outros usuários e configurações do sistema.</p>
              </div>
              <Switch 
                id="isAdmin" 
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({...formData, isAdmin: checked})}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="h-9 text-xs font-bold" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold px-6">Salvar Usuário</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Excluir Usuário"
      />
    </div>
  );
}
