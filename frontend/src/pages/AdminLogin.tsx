import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

const emptyRegister = {
  institution: "",
  name: "",
  email: "",
  phone: "",
  cnpj: "",
  password: "",
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ institution: "", email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const loginIdentifier = useMemo(() => loginForm.email.trim() || loginForm.institution.trim(), [loginForm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setLoginError(null);
      const response = await api.post<{ token: string; user: any }>("/login", {
        email: loginIdentifier,
        institution: loginForm.institution.trim(),
        password: loginForm.password,
      }, { skipAuth: true });

      if (response.user.role !== 'ADMIN') {
        setLoginError('Esse acesso é apenas para administradores.');
        return;
      }

      if (loginForm.institution.trim()) {
        const institutionMatch = [response.user.institution, response.user.cnpj]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase() === loginForm.institution.trim().toLowerCase());

        if (!institutionMatch) {
          setLoginError('Instituição/CNPJ não confere com o administrador informado.');
          return;
        }
      }

      setAuthSession(response.token, response.user);
      navigate('/admin', { replace: true });
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'Falha ao entrar no painel admin');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRegisterLoading(true);
      setRegisterError(null);
      setRegisterSuccess(null);
      await api.post('/admin', registerForm, { skipAuth: true });
      setRegisterSuccess('Instituição cadastrada com sucesso. Agora você já pode entrar no painel.');
      setLoginForm((current) => ({ ...current, institution: registerForm.cnpj || registerForm.institution, email: registerForm.email }));
      setRegisterForm(emptyRegister);
      setTab('login');
    } catch (err) {
      setRegisterError(err instanceof ApiError ? err.message : 'Falha ao cadastrar instituição');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full gradient-primary opacity-10 blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl glow-primary mb-4">
            <img src="/logo.png" alt="Logo Frota Digital" style={{ width: "auto", borderRadius: "1rem" }} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Painel <span className="text-gradient">Admin</span></h1>
          <p className="text-muted-foreground mt-2 text-lg">Acesso institucional e cadastro de instituição</p>
        </div>

        <div className="glass-card p-8">
          <Tabs value={tab} onValueChange={(value) => { setTab(value as 'login' | 'register'); setLoginError(null); setRegisterError(null); }}>
            <TabsList className="grid w-full grid-cols-2 h-12 bg-secondary mb-6">
              <TabsTrigger value="login" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Cadastrar instituição</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution" className="text-base font-medium">Instituição ou CNPJ</Label>
                    <Input id="institution" type="text" placeholder="Nome ou CNPJ" value={loginForm.institution} onChange={(e) => setLoginForm((current) => ({ ...current, institution: e.target.value }))} className="h-12 text-base bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-base font-medium">Email do administrador</Label>
                    <Input id="admin-email" type="text" placeholder="admin@instituicao.gov.br" value={loginForm.email} onChange={(e) => setLoginForm((current) => ({ ...current, email: e.target.value }))} className="h-12 text-base bg-secondary border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-base font-medium">Senha</Label>
                  <div className="relative">
                    <Input id="admin-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm((current) => ({ ...current, password: e.target.value }))} className="h-12 text-base pr-12 bg-secondary border-border" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
                {registerSuccess && tab === 'login' ? <p className="text-sm text-green-600">{registerSuccess}</p> : null}
                <Button type="submit" disabled={loginLoading} className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity">
                  {loginLoading ? 'Entrando...' : 'Acessar Painel'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="reg-institution" className="text-base font-medium">Nome da instituição</Label>
                    <Input id="reg-institution" value={registerForm.institution} onChange={(e) => setRegisterForm((current) => ({ ...current, institution: e.target.value }))} placeholder="Prefeitura de..." className="h-12 text-base bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-base font-medium">Nome do administrador</Label>
                    <Input id="reg-name" value={registerForm.name} onChange={(e) => setRegisterForm((current) => ({ ...current, name: e.target.value }))} placeholder="Nome completo" className="h-12 text-base bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className="text-base font-medium">Telefone</Label>
                    <Input id="reg-phone" value={registerForm.phone} onChange={(e) => setRegisterForm((current) => ({ ...current, phone: e.target.value }))} placeholder="(00) 00000-0000" className="h-12 text-base bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-base font-medium">Email do administrador</Label>
                    <Input id="reg-email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm((current) => ({ ...current, email: e.target.value }))} placeholder="admin@instituicao.gov.br" className="h-12 text-base bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-cnpj" className="text-base font-medium">CNPJ</Label>
                    <Input id="reg-cnpj" value={registerForm.cnpj} onChange={(e) => setRegisterForm((current) => ({ ...current, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className="h-12 text-base bg-secondary border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-base font-medium">Senha inicial</Label>
                  <div className="relative">
                    <Input id="reg-password" type={showRegisterPassword ? 'text' : 'password'} value={registerForm.password} onChange={(e) => setRegisterForm((current) => ({ ...current, password: e.target.value }))} placeholder="••••••••" className="h-12 text-base pr-12 bg-secondary border-border" />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {registerError ? <p className="text-sm text-destructive">{registerError}</p> : null}
                <Button type="submit" disabled={registerLoading} className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity">
                  {registerLoading ? 'Cadastrando...' : 'Cadastrar instituição'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-muted-foreground hover:text-primary gap-2 text-base">
            <ArrowLeft className="w-5 h-5" /> Voltar ao login
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;