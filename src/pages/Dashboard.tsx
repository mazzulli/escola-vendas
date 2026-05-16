import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Box,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  dailyTotal: number;
  dailyCount: number;
  monthlyTotal: number;
  lowStockCount: number;
  lowStockItems: any[];
  totalProducts: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/dashboard')
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Carrregando dados do painel...</div>;

  const stats = [
    { label: 'Vendas Hoje', value: `R$ ${data?.dailyTotal.toFixed(2)}`, count: `${data?.dailyCount} transações`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Vendas Mês', value: `R$ ${data?.monthlyTotal.toFixed(2)}`, count: 'Saldo acumulado', icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { label: 'Total Produtos', value: data?.totalProducts, count: 'Em catálogo', icon: Box, color: 'bg-slate-50 text-slate-600 border-slate-200' },
    { label: 'Estoque Baixo', value: data?.lowStockCount, count: 'Requer atenção', icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-[10px] font-medium text-slate-500">{stat.count}</p>
                  </div>
                  <div className={`p-2 rounded-lg border ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Low Stock */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">Ações do Operador</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-start p-4 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                onClick={() => navigate('/products')}
              >
                <Plus className="w-5 h-5 mb-2 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-bold">Novo Produto</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-start p-4 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                onClick={() => navigate('/sales')}
              >
                <ShoppingBag className="w-5 h-5 mb-2 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-bold">Registrar Venda</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">Relatório de Reposição</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data?.lowStockItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-sm">Estoque plenamente abastecido.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data?.lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                          <Box className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Mín. Alerta: {item.minStock} un</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 italic">{item.stock} unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Profile Info */}
        <div className="space-y-6">
          <Card className="bg-indigo-600 text-white border-0 overflow-hidden relative shadow-lg shadow-indigo-100">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
              <TrendingUp className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] uppercase font-bold text-indigo-200 tracking-widest">Meta de Vaturamento</CardTitle>
              <h3 className="text-2xl font-bold tracking-tight">R$ 5.000,00</h3>
            </CardHeader>
            <CardContent>
              <div className="h-1.5 bg-white/20 rounded-full mb-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data?.monthlyTotal || 0) / 5000 * 100, 100)}%` }}
                  className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                />
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold text-indigo-100 uppercase">Progresso</p>
                <p className="text-xs font-bold">{((data?.monthlyTotal || 0) / 5000 * 100).toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-slate-700">Conexão Neon DB OK</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-semibold text-slate-700">Autenticação JWT Ativa</span>
              </div>
              <Separator />
              <p className="text-[10px] text-slate-400 font-medium italic">
                Última atualização: {new Date().toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
