import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

const FirstLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const role = useMemo(() => {
    const value = searchParams.get("role");
    return value === "mechanic" ? "mechanic" : "driver";
  }, [searchParams]);

  const state = (location.state || {}) as {
    userId?: string;
    email?: string;
  };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!state.userId) {
        throw new Error("Usuário não identificado para o primeiro acesso.");
      }

      if (!password || password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }

      if (role === "driver") {
        await api.post(
          "/login/first-access/driver/complete",
          {
            userId: state.userId,
            password,
          },
          { skipAuth: true }
        );
      } else {
        await api.post(
          "/login/first-access/mechanic/complete",
          {
            userId: state.userId,
            password,
          },
          { skipAuth: true }
        );
      }

      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Falha ao definir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full gradient-primary opacity-10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl glow-primary mb-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            Criar <span className="text-gradient">nova senha</span>
          </h1>

          <p className="text-muted-foreground mt-2 text-base">
            Primeiro acesso do {role === "driver" ? "motorista" : "mecânico"}
          </p>

          {state.email ? (
            <p className="text-sm text-muted-foreground mt-2">{state.email}</p>
          ) : null}
        </div>

        <div className="glass-card p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="first-password" className="text-base font-medium">
              Nova senha
            </Label>
            <div className="relative">
              <Input
                id="first-password"
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

          <div className="space-y-2">
            <Label htmlFor="first-confirm-password" className="text-base font-medium">
              Confirmar senha
            </Label>
            <div className="relative">
              <Input
                id="first-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 text-base pr-12 bg-secondary border-border"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full"
          >
            Voltar para o login
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default FirstLogin;