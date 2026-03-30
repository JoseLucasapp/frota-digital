import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Eye, EyeOff, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'driver' | 'mechanic'>('driver');
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (role: 'DRIVER' | 'MECHANIC') => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<{ token: string; user: any; success: boolean }>("/login", {
        email: identifier.trim(),
        password,
      }, { skipAuth: true });

      if (response.user.role !== role) {
        setError(role === 'DRIVER' ? 'Esse acesso é apenas para motoristas.' : 'Esse acesso é apenas para mecânicos.');
        return;
      }

      setAuthSession(response.token, response.user);
      const mustSetPassword = response.user?.is_first_acc !== false;

      if (mustSetPassword) {
        navigate(`/first-login?role=${role === 'DRIVER' ? 'driver' : 'mechanic'}`, { replace: true });
      } else {
        navigate(role === 'DRIVER' ? '/driver' : '/mechanic', { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full gradient-primary opacity-10 blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl glow-primary mb-4">
            <img src="/logo.png" alt="Logo Frota Digital" style={{ width: "auto", borderRadius: "1rem" }} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Acesso <span className="text-gradient">Frota Digital</span></h1>
          <p className="text-muted-foreground mt-2 text-lg">Motoristas e mecânicos</p>
        </div>

        <div className="glass-card p-8">
          <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as 'driver' | 'mechanic'); setError(null); }}>
            <TabsList className="grid w-full grid-cols-2 h-12 bg-secondary mb-6">
              <TabsTrigger value="driver" className="flex-1 text-base gap-2 data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
                <Car className="w-4 h-4" /> Motorista
              </TabsTrigger>
              <TabsTrigger value="mechanic" className="flex-1 text-base gap-2 data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
                <Wrench className="w-4 h-4" /> Mecânico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="driver">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('DRIVER'); }} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="driver-identifier" className="text-base font-medium">Email</Label>
                  <Input id="driver-identifier" type="text" placeholder="seu@email.com" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 text-base bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-password" className="text-base font-medium">Senha</Label>
                  <div className="relative">
                    <Input id="driver-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 text-base pr-12 bg-secondary border-border" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity">
                  {loading && activeTab === 'driver' ? 'Entrando...' : 'Entrar como Motorista'}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate("/first-login?role=driver")}
                  className="text-sm text-primary hover:underline"
                >
                  Primeiro acesso? Criar senha
                </button>
              </form>
            </TabsContent>

            <TabsContent value="mechanic">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('MECHANIC'); }} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="mech-identifier" className="text-base font-medium">Email</Label>
                  <Input id="mech-identifier" type="text" placeholder="oficina@email.com" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 text-base bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mech-password" className="text-base font-medium">Senha</Label>
                  <div className="relative">
                    <Input id="mech-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 text-base pr-12 bg-secondary border-border" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity">
                  {loading && activeTab === 'mechanic' ? 'Entrando...' : 'Entrar como Mecânico'}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate("/first-login?role=mechanic")}
                  className="text-sm text-primary hover:underline"
                >
                  Primeiro acesso? Criar senha
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate('/admin-login')} className="text-muted-foreground hover:text-primary text-base">
            Acesso do painel admin
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;