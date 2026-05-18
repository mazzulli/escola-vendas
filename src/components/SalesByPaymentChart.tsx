import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { apiFetch } from '../lib/utils';

interface PaymentData {
  name: string;
  value: number;
  count: number;
  method: string;
}

const COLORS = {
  MONEY: '#10b981',
  PIX: '#3b82f6',
  DEBIT: '#f59e0b',
  CREDIT: '#8b5cf6',
};

export default function SalesByPaymentChart() {
  const [data, setData] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {    
    apiFetch('/dashboard/sales-by-payment-method')
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
          <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">
            Vendas por Tipo de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-64 text-slate-400">
            Carregando gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-700 shadow-lg">
          <p className="font-bold text-sm">{data.name}</p>
          <p className="text-sm">Valor: R$ {data.value.toFixed(2)}</p>
          <p className="text-xs text-slate-300">{data.count} transação(ões)</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        {payload.map((entry: any, index: number) => {
          const item = data[index];
          return (
            <div key={entry.dataKey} className="flex items-start space-x-2">
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                <p className="text-xs text-slate-500">R$ {item.value.toFixed(2)}</p>
                <p className="text-xs text-slate-400">{item.count} venda(s)</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">
            Vendas por Tipo de Pagamento
          </CardTitle>
          <span className="text-lg font-bold text-slate-900">
            R$ {totalValue.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            Nenhuma venda registrada
          </div>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry: PaymentData) => (
                    <Cell
                      key={`cell-${entry.method}`}
                      fill={COLORS[entry.method as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <CustomLegend payload={data.map((item, idx) => ({ dataKey: item.method, color: COLORS[item.method as keyof typeof COLORS], name: item.name }))} />
      </CardContent>
    </Card>
  );
}
