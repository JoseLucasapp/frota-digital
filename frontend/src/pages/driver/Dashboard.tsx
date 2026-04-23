import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Fuel,
  Wrench,
  FileText,
  Clock,
  LogOut,
  ChevronRight,
  AlertTriangle,
  MapPin,
  LocateFixed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { clearAuthSession, getAuthUser } from "@/lib/auth";
import { toast } from "sonner";

const quickActions = [
  { icon: Fuel, label: "Registrar Abastecimento", path: "/driver/fuel", color: "text-warning" },
  { icon: Wrench, label: "Reportar Problema", path: "/driver/maintenance", color: "text-destructive" },
  { icon: FileText, label: "Meus Documentos", path: "/driver/documents", color: "text-info" },
  { icon: Clock, label: "Histórico", path: "/driver/history", color: "text-primary" },
];

type TrackingPayload = {
  vehicle_id: string;
  address?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const user = getAuthUser();

  const [status, setStatus] = useState<"parado" | "uso">("parado");
  const [loans, setLoans] = useState<any[]>([]);
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trackingAddress, setTrackingAddress] = useState("");
  const [trackingNotes, setTrackingNotes] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  useEffect(() => {
    if (user?.is_first_acc !== false) {
      navigate("/first-login?role=driver", { replace: true });
    }
  }, [navigate, user?.is_first_acc]);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);

        const [loanRes, fuelingRes, maintenanceRes, vehicleRes] = await Promise.all([
          api.get<{ data: any[] }>("/loans", { limit: 200 }),
          api.get<{ data: any[] }>("/fueling", { limit: 200 }),
          api.get<{ data: any[] }>("/maintenances", { limit: 200 }),
          api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
        ]);

        setLoans(loanRes.data || []);
        setFuelings(fuelingRes.data || []);
        setMaintenances(maintenanceRes.data || []);
        setVehicles(vehicleRes.data || []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Erro ao carregar dashboard");
      }
    };

    load();
  }, []);

  const currentLoan = useMemo(() => {
    const ownLoans = loans.filter((loan) => loan.driver_id === user?.id);
    return ownLoans.sort(
      (a, b) =>
        new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
    )[0];
  }, [loans, user?.id]);

  const currentVehicle = useMemo(() => {
    if (!currentLoan) return null;
    return vehicles.find((vehicle) => vehicle.id === currentLoan.vehicle_id) || null;
  }, [currentLoan, vehicles]);

  useEffect(() => {
    if (currentVehicle?.last_address) {
      setTrackingAddress(currentVehicle.last_address);
    }
  }, [currentVehicle?.id, currentVehicle?.last_address]);

  const myFuelings = useMemo(() => {
    if (!currentVehicle?.id) return [];
    return fuelings
      .filter((item) => item.vehicle_id === currentVehicle.id)
      .sort(
        (a, b) =>
          new Date(b.created_at || b.date || 0).getTime() -
          new Date(a.created_at || a.date || 0).getTime()
      );
  }, [fuelings, currentVehicle?.id]);

  const myMaintenances = useMemo(() => {
    if (!currentVehicle?.id) return [];
    return maintenances
      .filter((item) => item.vehicle_id === currentVehicle.id)
      .sort(
        (a, b) =>
          new Date(a.created_at || a.updated_at || 0).getTime() -
          new Date(b.created_at || b.updated_at || 0).getTime()
      );
  }, [maintenances, currentVehicle?.id]);

  const lastFuel = useMemo(() => {
    const item = myFuelings[0];
    if (!item) return null;

    const total = Number(
      item.total_price || Number(item.liters || 0) * Number(item.price_per_liter || 0)
    );

    return {
      date: item.created_at || item.date,
      liters: Number(item.liters || 0),
      cost: total,
    };
  }, [myFuelings]);

  const nextMaintenance = useMemo(() => {
    if (!myMaintenances.length) return null;

    const pending = myMaintenances.find((item) =>
      ["pending", "PENDING", "in_progress", "IN_PROGRESS"].includes(String(item.status || ""))
    );

    const item = pending || myMaintenances[0];
    const sourceDate = item.created_at || item.updated_at;

    if (!sourceDate) {
      return {
        dateLabel: "Sem data",
        daysLabel: "",
        item,
      };
    }

    const date = new Date(sourceDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let daysLabel = "";
    if (diffDays > 0) {
      daysLabel = `Em ${diffDays} dias`;
    } else if (diffDays === 0) {
      daysLabel = "Hoje";
    } else {
      daysLabel = `${Math.abs(diffDays)} dias atrás`;
    }

    return {
      dateLabel: date.toLocaleDateString("pt-BR"),
      daysLabel,
      item,
    };
  }, [myMaintenances]);

  useEffect(() => {
    if (!currentVehicle) {
      setStatus("parado");
      return;
    }

    const rawStatus = String(currentVehicle.status || "").toLowerCase();
    setStatus(rawStatus === "active" || rawStatus === "em_uso" || rawStatus === "in_use" ? "uso" : "parado");
  }, [currentVehicle]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const refreshVehicles = async () => {
    const vehicleRes = await api.get<{ data: any[] }>("/vehicle", { limit: 200 });
    setVehicles(vehicleRes.data || []);
  };

  const saveTracking = async (payload: TrackingPayload) => {
    if (!currentVehicle?.id) {
      toast.error("Nenhum veículo vinculado ao motorista.");
      return;
    }

    try {
      setSavingTracking(true);
      await api.post("/tracking/logs", payload);
      toast.success("Localização atualizada com sucesso.");
      setTrackingNotes("");
      await refreshVehicles();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao salvar localização");
    } finally {
      setSavingTracking(false);
    }
  };

  const handleManualTrackingSave = async () => {
    if (!currentVehicle?.id) {
      toast.error("Nenhum veículo vinculado ao motorista.");
      return;
    }

    if (!trackingAddress.trim()) {
      toast.error("Informe um endereço ou use a localização do navegador.");
      return;
    }

    await saveTracking({
      vehicle_id: currentVehicle.id,
      address: trackingAddress.trim(),
      notes: trackingNotes.trim() || undefined,
      source: "manual",
    });
  };

  const handleBrowserLocation = async () => {
    if (!currentVehicle?.id) {
      toast.error("Nenhum veículo vinculado ao motorista.");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador.");
      return;
    }

    setSavingTracking(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post("/tracking/logs", {
            vehicle_id: currentVehicle.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: trackingAddress.trim() || undefined,
            notes: trackingNotes.trim() || undefined,
            source: "browser_geolocation",
          });

          toast.success("Localização capturada pelo navegador.");
          setTrackingNotes("");
          await refreshVehicles();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Erro ao salvar localização");
        } finally {
          setSavingTracking(false);
        }
      },
      () => {
        setSavingTracking(false);
        toast.error("Não foi possível obter sua localização. Você pode preencher manualmente.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-6 pb-16 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-base">Bem-vindo,</p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {user?.name || "Motorista"}
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

      <div className="px-4 -mt-10 pb-8 max-w-lg mx-auto space-y-5">
        {error ? (
          <div className="glass-card p-4 text-sm text-destructive">{error}</div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>

            <div className="flex-1">
              <p className="font-bold text-foreground text-lg">
                {currentVehicle
                  ? [currentVehicle.make, currentVehicle.model].filter(Boolean).join(" ") || "Veículo"
                  : "Sem veículo vinculado"}
              </p>
              <p className="font-mono text-primary text-lg font-semibold">
                {currentVehicle?.plate || "—"}
              </p>
            </div>

            <Badge className={status === "uso" ? "bg-success/20 text-success border-0" : "bg-muted text-muted-foreground border-0"}>
              {status === "uso" ? "Ativo" : "Parado"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">KM Atual</p>
              <p className="text-lg font-bold text-foreground">
                {currentVehicle
                  ? Number(currentVehicle.current_km || 0).toLocaleString("pt-BR")
                  : "—"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">Ano</p>
              <p className="text-lg font-bold text-foreground">
                {currentVehicle?.year || "—"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">Atualizar localização</p>
              <p className="text-sm text-muted-foreground">Use o navegador ou preencha manualmente</p>
            </div>
          </div>

          <div className="rounded-xl bg-secondary/40 p-3 text-sm">
            <p className="text-muted-foreground">Última localização salva</p>
            <p className="font-medium text-foreground mt-1">{currentVehicle?.last_address || "Sem endereço informado"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentVehicle?.last_tracked_at
                ? `Atualizado em ${new Date(currentVehicle.last_tracked_at).toLocaleString("pt-BR")}`
                : "Nenhuma atualização enviada ainda"}
            </p>
          </div>

          <div className="space-y-3">
            <Input
              value={trackingAddress}
              onChange={(event) => setTrackingAddress(event.target.value)}
              placeholder="Endereço atual do veículo"
              disabled={!currentVehicle || savingTracking}
            />
            <Textarea
              value={trackingNotes}
              onChange={(event) => setTrackingNotes(event.target.value)}
              placeholder="Observação opcional"
              disabled={!currentVehicle || savingTracking}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button onClick={handleBrowserLocation} disabled={!currentVehicle || savingTracking} className="w-full">
              <LocateFixed className="w-4 h-4 mr-2" />
              Usar minha localização
            </Button>
            <Button onClick={handleManualTrackingSave} disabled={!currentVehicle || savingTracking} variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Salvar manualmente
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => navigate(action.path)}
              className="glass-card p-4 flex items-center gap-4 text-left w-full hover:scale-[1.01] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{action.label}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid gap-4"
        >
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground">Último Abastecimento</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {lastFuel ? `${lastFuel.liters.toLocaleString("pt-BR")} L` : "Sem registros"}
                </p>
              </div>
              <Fuel className="w-6 h-6 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">
              {lastFuel
                ? `R$ ${lastFuel.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} • ${new Date(lastFuel.date).toLocaleDateString("pt-BR")}`
                : "Ainda não há abastecimentos vinculados ao seu veículo."}
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground">Próxima Manutenção</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {nextMaintenance ? nextMaintenance.dateLabel : "Nenhuma manutenção"}
                </p>
              </div>
              <Wrench className="w-6 h-6 text-info" />
            </div>
            <p className="text-sm text-muted-foreground">
              {nextMaintenance
                ? `${nextMaintenance.item.description || "Manutenção pendente"} ${nextMaintenance.daysLabel ? `• ${nextMaintenance.daysLabel}` : ""}`
                : "Nenhuma manutenção prevista para o seu veículo."}
            </p>
          </div>

          <div className="glass-card p-5 border border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Lembrete</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Atualize sua localização pelo menos a cada 2 horas enquanto estiver com o veículo.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverDashboard;
