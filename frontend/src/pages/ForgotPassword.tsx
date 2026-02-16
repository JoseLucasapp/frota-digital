import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Informe seu email", variant: "destructive" });
      return;
    }
    toast({
      title: "Código enviado!",
      description: `Um código de verificação foi enviado para ${email}.`,
    });
    setStep("code");
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      toast({
        title: "Código inválido",
        description: "Digite o código de 6 dígitos.",
        variant: "destructive",
      });
      return;
    }
    setStep("reset");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter no mínimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Senhas não conferem", variant: "destructive" });
      return;
    }
    toast({
      title: "Senha redefinida com sucesso!",
      description: "Agora você pode fazer login com sua nova senha.",
    });
    navigate("/login");
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
            <KeyRound className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Recuperar Senha
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === "email" &&
              "Informe seu email para receber o código de recuperação."}
            {step === "code" && "Digite o código enviado para seu email."}
            {step === "reset" && "Defina sua nova senha."}
          </p>
        </div>

        <div className="glass-card p-8">
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="recover-email"
                  className="text-base font-medium"
                >
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="recover-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base bg-secondary border-border"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                <Mail className="w-5 h-5 mr-2" />
                Enviar Código
              </Button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="verify-code" className="text-base font-medium">
                  Código de Verificação
                </Label>
                <Input
                  id="verify-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="h-12 text-base text-center tracking-[0.5em] font-mono bg-secondary border-border"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                Verificar Código
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-primary hover:underline"
              >
                Reenviar código
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-pw" className="text-base font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
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
                <Label htmlFor="confirm-pw" className="text-base font-medium">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 text-base bg-secondary border-border"
                />
                {confirmPassword.length > 0 && (
                  <p
                    className={`text-sm ${password === confirmPassword ? "text-success" : "text-destructive"}`}
                  >
                    {password === confirmPassword
                      ? "✓ Senhas conferem"
                      : "✗ Senhas não conferem"}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                Redefinir Senha
              </Button>
            </form>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-primary gap-2 text-base"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Login
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
