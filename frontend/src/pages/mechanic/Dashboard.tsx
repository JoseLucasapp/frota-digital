import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  LogOut,
  CheckCircle,
  Clock,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError, API_BASE } from "@/lib/api";
import { clearAuthSession, getAuthToken, getAuthUser } from "@/lib/auth";

const statusMap: Record<
  string,
  {
    label: string;
    className: string;
    icon: any;
  }
> = {
  pending: {
    label: "Pendente",
    className: "bg-warning/20 text-warning border-0",
    icon: Clock,
  },
  in_progress: {
    label: "Em andamento",
    className: "bg-info/20 text-info border-0",
    icon: Wrench,
  },
  completed: {
    label: "Concluída",
    className: "bg-success/20 text-success border-0",
    icon: CheckCircle,
  },
  PENDING: {
    label: "Pendente",
    className: "bg-warning/20 text-warning border-0",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "Em andamento",
    className: "bg-info/20 text-info border-0",
    icon: Wrench,
  },
  COMPLETED: {
    label: "Concluída",
    className: "bg-success/20 text-success border-0",
    icon: CheckCircle,
  },
};

const normalizeStatus = (status: string | null | undefined) => {
  const raw = String(status || "").toLowerCase();

  if (raw === "pending") return "pending";
  if (raw === "in_progress") return "in_progress";
  if (raw === "completed") return "completed";

  return "pending";
};

const MechanicDashboard = () => {
  const navigate = useNavigate();
  const user = getAuthUser();
  const token = getAuthToken();

  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (user?.is_first_acc !== false) {
      navigate("/first-login?role=mechanic", { replace: true });
    }
  }, [navigate, user?.is_first_acc]);

  const loadData = async () => {
    try {
      setError(null);

      const [maintenanceRes, vehicleRes] = await Promise.all([
        api.get<{ data: any[] }>("/maintenances", { limit: 300 }),
        api.get<{ data: any[] }>("/vehicle", { limit: 300 }),
      ]);

      setMaintenances(maintenanceRes.data || []);
      setVehicles(vehicleRes.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar manutenções");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const ownItems = useMemo(() => {
    return maintenances.filter((item) => !user?.id || item.mechanic_id === user.id);
  }, [maintenances, user]);

  const vehicleMap = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles]
  );

  const stats = useMemo(() => {
    return {
      pending: ownItems.filter((item) => normalizeStatus(item.status) === "pending").length,
      inProgress: ownItems.filter((item) => normalizeStatus(item.status) === "in_progress").length,
      completed: ownItems.filter((item) => normalizeStatus(item.status) === "completed").length,
    };
  }, [ownItems]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const handleStatusChange = async (maintenanceId: string, newStatus: string) => {
    try {
      setError(null);
      setMessage(null);

      await api.put(`/maintenances/${maintenanceId}`, {
        status: newStatus.toUpperCase(),
      });

      setMaintenances((current) =>
        current.map((item) =>
          item.id === maintenanceId
            ? { ...item, status: newStatus.toUpperCase() }
            : item
        )
      );

      setMessage("Status atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar status");
    }
  };

  const uploadReceipt = async (maintenanceId: string, file: File) => {
    try {
      setUploadingId(maintenanceId);
      setError(null);
      setMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_BASE}/maintenances/${maintenanceId}/receipt`,
        {
          method: "POST",
          headers: token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : undefined,
          body: formData,
        }
      );

      const text = await response.text();
      let payload: any = null;

      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text;
      }

      if (!response.ok) {
        throw new Error(payload?.message || "Erro ao enviar NF");
      }

      setMessage("NF/comprovante enviado com sucesso.");
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar NF");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-6 pb-16 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-base">Oficina</p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {user?.name || user?.institution || user?.email || "Mecânico"}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="text-primary-foreground/80 hover:text-primary-foreground"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="px-4 -mt-10 pb-8 max-w-2xl mx-auto space-y-5">
        {error ? (
          <div className="glass-card p-4 text-sm text-destructive">{error}</div>
        ) : null}

        {message ? (
          <div className="glass-card p-4 text-sm text-green-600">{message}</div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>

          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">Em andamento</p>
          </div>

          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Concluídas</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Ordens de Serviço</h2>

          <div className="space-y-4">
            {ownItems.map((wo) => {
              const normalized = normalizeStatus(wo.status);
              const currentStatus = statusMap[wo.status] || statusMap[normalized];
              const StatusIcon = currentStatus.icon;
              const vehicle = vehicleMap[wo.vehicle_id];

              return (
                <div key={wo.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-bold text-foreground">
                          {wo.description || "Manutenção"}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {vehicle?.plate || wo.vehicle_id} •{" "}
                          {String(wo.type || "").toLowerCase() === "preventive"
                            ? "Preventiva"
                            : String(wo.type || "").toLowerCase() === "corrective"
                              ? "Corretiva"
                              : wo.type || "Serviço"}
                        </p>
                      </div>
                    </div>

                    <Badge className={currentStatus.className}>
                      {currentStatus.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                    <span>
                      Custo:{" "}
                      <strong className="text-foreground">
                        R${" "}
                        {Number(wo.estimated_cost || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </span>

                    <span>
                      {wo.created_at
                        ? new Date(wo.created_at).toLocaleDateString("pt-BR")
                        : "Sem data"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={normalized}
                      onValueChange={(value) => handleStatusChange(wo.id, value)}
                    >
                      <SelectTrigger className="h-10 bg-secondary border-border flex-1">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 h-10 border-border"
                      onClick={() => fileInputRefs.current[wo.id]?.click()}
                      disabled={uploadingId === wo.id}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingId === wo.id ? "Enviando..." : "NF"}
                    </Button>

                    <input
                      ref={(el) => {
                        fileInputRefs.current[wo.id] = el;
                      }}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadReceipt(wo.id, file);
                        }
                        e.currentTarget.value = "";
                      }}
                    />
                  </div>

                  {wo.receipt_url ? (
                    <a
                      href={wo.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      Ver NF atual
                    </a>
                  ) : null}
                </div>
              );
            })}

            {!ownItems.length ? (
              <div className="glass-card p-5">
                <p className="text-sm text-muted-foreground">
                  Nenhuma manutenção encontrada.
                </p>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MechanicDashboard;