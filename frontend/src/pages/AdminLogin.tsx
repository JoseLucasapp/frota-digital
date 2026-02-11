import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full gradient-primary opacity-10 blur-[120px]" />

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
            Painel <span className="text-gradient">Admin</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Acesso institucional
          </p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Login Institucional
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-base font-medium">
                Instituição / CNPJ
              </Label>
              <Input
                id="institution"
                type="text"
                placeholder="Nome ou CNPJ da instituição"
                className="h-12 text-base bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-base font-medium">
                Email do administrador
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@instituicao.gov.br"
                className="h-12 text-base bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-base font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
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

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
            >
              Acessar Painel
            </Button>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-primary gap-2 text-base"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao login
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
