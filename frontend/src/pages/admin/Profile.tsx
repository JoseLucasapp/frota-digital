import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, Phone, User } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getAuthUser, setAuthSession, getAuthToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminProfile = () => {
  const authUser = getAuthUser();
  const token = getAuthToken();

  const [form, setForm] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    institution: authUser?.institution || "",
    cnpj: authUser?.cnpj || "",
  });

  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<"request" | "code" | "password">("request");
  const [passwordCode, setPasswordCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const reloadProfile = async () => {
    if (!authUser?.id) return;

    try {
      setBootLoading(true);
      setError(null);

      const response = await api.get<{ success: boolean; data: any }>("/admin", {
        page: 1,
        pageSize: 100,
      });

      const admins = response?.data?.data || [];
      const current = admins.find((item: any) => item.id === authUser.id);

      if (current) {
        setForm((prev) => ({
          ...prev,
          name: current.name || "",
          email: current.email || "",
          phone: current.phone || "",
          institution: current.institution || "",
          cnpj: current.cnpj || "",
        }));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar perfil");
    } finally {
      setBootLoading(false);
    }
  };

  useEffect(() => {
    reloadProfile();
  }, []);

  const save = async () => {
    if (!authUser?.id) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const payload: any = {
        name: form.name,
        phone: form.phone,
      };

      const response = await api.put(`/admin/${authUser.id}`, payload);

      const updatedUser = {
        ...authUser,
        ...payload,
      };

      if (token) {
        setAuthSession(token, updatedUser as any);
      }

      setMessage(
        (response as any)?.message || "Perfil atualizado com sucesso"
      );


    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };


  const requestPasswordCode = async () => {
    try {
      setPasswordLoading(true);
      setError(null);
      setMessage(null);
      const response = await api.post<{ message?: string }>("/admin/password-code/request");
      setMessage(response?.message || "Código enviado para o email cadastrado.");
      setPasswordStep("code");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao enviar código");
    } finally {
      setPasswordLoading(false);
    }
  };

  const verifyPasswordCode = async () => {
    try {
      setPasswordLoading(true);
      setError(null);
      setMessage(null);
      await api.post("/admin/password-code/verify", { code: passwordCode });
      setPasswordStep("password");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao confirmar código");
    } finally {
      setPasswordLoading(false);
    }
  };

  const confirmPasswordChange = async () => {
    try {
      setPasswordLoading(true);
      setError(null);
      setMessage(null);
      const response = await api.post<{ message?: string }>("/admin/password-code/confirm", {
        code: passwordCode,
        password: newPassword,
      });
      setMessage(response?.message || "Senha alterada com sucesso.");
      setPasswordModalOpen(false);
      setPasswordStep("request");
      setPasswordCode("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao alterar senha");
    } finally {
      setPasswordLoading(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setPasswordStep("request");
    setPasswordCode("");
    setNewPassword("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground text-lg">Dados da instituição e do administrador</p>
      </div>

      {bootLoading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando perfil...</div> : null}
      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {message ? <div className="glass-card p-4 text-sm text-green-600">{message}</div> : null}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {(form.name || form.institution || "AD").slice(0, 2).toUpperCase()}
          </div>

          <div>
            <p className="text-lg font-semibold text-foreground">{form.name || "Administrador"}</p>
            <p className="text-sm text-muted-foreground">{form.email || "—"}</p>
          </div>

          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{form.institution || "Instituição não informada"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{form.phone || "Telefone não informado"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{form.email || "Email não informado"}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do administrador</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="pl-10 h-12 bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.email}
                  readOnly
                  disabled
                  className="pl-10 h-12 bg-secondary border-border opacity-70"
                />
                <p className="text-xs text-muted-foreground">Email bloqueado para edição.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                  className="pl-10 h-12 bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instituição</Label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.institution}
                  readOnly
                  disabled
                  className="pl-10 h-12 bg-secondary border-border opacity-70"
                />
                <p className="text-xs text-muted-foreground">Instituição bloqueada para edição.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={form.cnpj}
                readOnly
                disabled
                className="h-12 bg-secondary border-border opacity-70"
              />
              <p className="text-xs text-muted-foreground">CNPJ bloqueado para edição.</p>
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <Button
                type="button"
                variant="outline"
                onClick={openPasswordModal}
                className="h-12 w-full justify-center bg-secondary border-border"
              >
                Alterar senha por código de email
              </Button>
            </div>
          </div>

          <Button
            disabled={loading}
            onClick={save}
            className="w-full h-12 text-base gradient-primary text-primary-foreground"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>

      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>

          {passwordStep === "request" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enviaremos um código para {form.email || "o email cadastrado"}.
              </p>
              <Button disabled={passwordLoading} onClick={requestPasswordCode} className="w-full h-12 gradient-primary text-primary-foreground">
                {passwordLoading ? "Enviando..." : "Enviar código"}
              </Button>
            </div>
          ) : null}

          {passwordStep === "code" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Código recebido por email</Label>
                <Input
                  value={passwordCode}
                  onChange={(e) => setPasswordCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Digite o código de 6 dígitos"
                  className="h-12 bg-secondary border-border"
                />
              </div>
              <Button disabled={passwordLoading || passwordCode.length !== 6} onClick={verifyPasswordCode} className="w-full h-12 gradient-primary text-primary-foreground">
                {passwordLoading ? "Confirmando..." : "Confirmar código"}
              </Button>
            </div>
          ) : null}

          {passwordStep === "password" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="h-12 bg-secondary border-border"
                />
              </div>
              <Button disabled={passwordLoading || newPassword.length < 6} onClick={confirmPasswordChange} className="w-full h-12 gradient-primary text-primary-foreground">
                {passwordLoading ? "Salvando..." : "Alterar senha"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default AdminProfile;