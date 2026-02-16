import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Shield, Eye, EyeOff, Wrench, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showFirstLoginHelp, setShowFirstLoginHelp] = useState(false);

  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/driver");
  };

  const handleMechanicLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/mechanic");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full gradient-primary opacity-10 blur-[120px]" />

      {/* Modal simples */}
      {showFirstLoginHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowFirstLoginHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">
                  Primeiro acesso
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Se for seu primeiro login, basta informar{" "}
                  <strong>email/CPF</strong> (ou <strong>email/CNPJ</strong>) e
                  clicar em <strong>Entrar</strong>. Você será direcionado(a)
                  para definir sua senha.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFirstLoginHelp(false)}
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl glow-primary mb-4">
            <img
              src="/logo.png"
              alt="Logo Frota Digital"
              style={{ width: "auto", borderRadius: "1rem" }}
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Frota <span className="text-gradient">Digital</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gestão inteligente de frota
          </p>
        </div>

        <div className="glass-card p-8">
          {/* Hint geral (aparece sempre) */}
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground leading-snug">
                <span className="font-semibold text-foreground">
                  Primeiro acesso?
                </span>{" "}
                Só informe o email e clique em{" "}
                <span className="font-semibold text-foreground">Entrar</span>{" "}
                para definir a senha.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFirstLoginHelp(true)}
              className="text-sm text-primary hover:underline shrink-0"
            >
              Ver mais
            </button>
          </div>

          <Tabs defaultValue="driver" className="w-full">
            <TabsList className="w-full h-12 bg-secondary mb-6">
              <TabsTrigger
                value="driver"
                className="flex-1 text-base gap-2 data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground"
              >
                <Car className="w-4 h-4" /> Motorista
              </TabsTrigger>
              <TabsTrigger
                value="mechanic"
                className="flex-1 text-base gap-2 data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground"
              >
                <Wrench className="w-4 h-4" /> Mecânico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="driver">
              <form onSubmit={handleDriverLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="driver-email"
                    className="text-base font-medium"
                  >
                    Email ou CPF
                  </Label>
                  <Input
                    id="driver-email"
                    type="text"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="driver-password"
                    className="text-base font-medium"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="driver-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base pr-12 bg-secondary border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => handleForgotPassword(e)}
                >
                  Esqueceu a senha?
                </button>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
                >
                  Entrar como Motorista
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="mechanic">
              <form onSubmit={handleMechanicLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="mech-email" className="text-base font-medium">
                    Email ou CNPJ
                  </Label>
                  <Input
                    id="mech-email"
                    type="text"
                    placeholder="oficina@email.com"
                    className="h-12 text-base bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="mech-password"
                    className="text-base font-medium"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="mech-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 text-base pr-12 bg-secondary border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
                >
                  Entrar como Mecânico
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-login")}
            className="text-muted-foreground hover:text-primary gap-2 text-base"
          >
            <Shield className="w-5 h-5" />
            Painel Admin
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
