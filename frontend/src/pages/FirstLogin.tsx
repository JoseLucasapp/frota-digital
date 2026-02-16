import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const FirstLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "driver";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const allValid = Object.values(passwordChecks).every(Boolean);
  const match = password === confirmPassword && confirmPassword.length > 0;

 const handleAfterFirstLogin = () => {
   if (role === "mechanic") {
     localStorage.setItem("first_login_done_mechanic", "1");
     navigate("/mechanic", { replace: true });
   } else {
     localStorage.setItem("first_login_done_driver", "1");
     navigate("/driver", { replace: true });
   }
 };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allValid) {
      toast({
        title: "Senha fraca",
        description: "Atenda todos os requisitos de senha.",
        variant: "destructive",
      });
      return;
    }
    if (!match) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Senha definida com sucesso!",
      description: "Agora você pode acessar.",
    });

    handleAfterFirstLogin();
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Primeiro Acesso
          </h1>
          <p className="text-muted-foreground mt-2">
            {role === "mechanic"
              ? "Bem-vindo(a) à plataforma! Defina sua senha para acessar como mecânico."
              : "Bem-vindo(a) à plataforma! Defina sua senha para acessar como motorista."}
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-base font-medium">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
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

            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-base font-medium"
              >
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 text-base pr-12 bg-secondary border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p
                  className={`text-sm ${match ? "text-success" : "text-destructive"}`}
                >
                  {match ? "✓ Senhas conferem" : "✗ Senhas não conferem"}
                </p>
              )}
            </div>

            {/* Password requirements */}
            <div className="space-y-1.5 p-3 rounded-lg bg-secondary/50">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Requisitos da senha:
              </p>
              {[
                { key: "length", label: "Mínimo 8 caracteres" },
                { key: "upper", label: "Uma letra maiúscula" },
                { key: "number", label: "Um número" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${passwordChecks[key as keyof typeof passwordChecks] ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    {passwordChecks[key as keyof typeof passwordChecks]
                      ? "✓"
                      : ""}
                  </div>
                  <span
                    className={`text-sm ${passwordChecks[key as keyof typeof passwordChecks] ? "text-success" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={!allValid || !match}
              className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Lock className="w-5 h-5 mr-2" />
              Definir Senha
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FirstLogin;
