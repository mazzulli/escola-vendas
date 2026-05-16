import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { apiFetch } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Key, ShoppingBasket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleRequestOTP = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      toast.success(res.message);
      // if (res.otp) {
        // console.log("-----------------------------------------");
        // console.log("SEU CÓDIGO DE ACESSO (OTP):", res.otp);
        // console.log("-----------------------------------------");
        // toast.info(`CÓDIGO DE TESTE: ${res.otp}`, { duration: 10000 });
      // }
      setStep('verify');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      login(res.token, res.user);
      toast.success("Bem-vindo de volta!");
      navigate('/'); // Explicitly navigate to dashboard
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-200 mb-4 rotate-3">
            E
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Escola Vendas <span className="text-indigo-600">Pro</span></h1>
          <p className="text-slate-400 text-sm font-medium">Terminal de Acesso Seguro</p>
        </div>

        <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <div className="h-2 bg-indigo-600" />
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight text-slate-800">
              {step === 'request' ? 'Olá, Operador' : 'Verificando Identidade'}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {step === 'request' 
                ? 'Insira as credenciais de acesso' 
                : 'Código de autorização requerido'}
            </CardDescription>
          </CardHeader>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={step === 'request' ? handleRequestOTP : handleVerifyOTP}>
                <CardContent className="space-y-4 pt-2">
                  {step === 'request' ? (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Identificação (E-mail)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@escolavendas.pro"
                          className="pl-9 h-11 text-xs border-slate-200 focus:ring-indigo-500 rounded-xl"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="code" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Token de segurança</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-4 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          id="code"
                          type="text"
                          placeholder="••••••"
                          className="pl-9 h-14 text-center tracking-[0.5em] font-mono text-2xl font-bold border-slate-200 focus:ring-indigo-500 rounded-xl"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          O token expira em 300 segundos
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-2">
                  <Button type="submit" className="mt-6 w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? 'Autenticando...' : (step === 'request' ? 'Emitir Token de Acesso' : 'Efetivar Login')}
                  </Button>
                  {step === 'verify' && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-slate-400 h-8 text-[10px] font-bold uppercase hover:bg-slate-50" 
                      onClick={() => setStep('request')}
                      disabled={isLoading}
                    >
                      Refazer identificação
                    </Button>
                  )}
                </CardFooter>
              </form>
            </motion.div>
          </AnimatePresence>
        </Card>
        
        <div className="mt-8 text-center space-y-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">EscolaVendas v2.0 Enterprise</p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-300">
            <span>CONEXÃO SEGURA</span>
            <span>CRIPTOGRAFIA AES-256</span>
            <span>BANCO DE DADOS POSTGRESQL</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
