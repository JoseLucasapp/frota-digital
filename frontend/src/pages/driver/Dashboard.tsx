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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { clearAuthSession, getAuthUser } from "@/lib/auth";

const quickActions = [
  { icon: Fuel, label: "Registrar Abastecimento", path: "/driver/fuel", color: "text-warning" },
  { icon: Wrench, label: "Reportar Problema", path: "/driver/maintenance", color: "text-destructive" },
  { icon: FileText, label: "Meus Documentos", path: "/driver/documents", color: "text-info" },
  { icon: Clock, label: "Histórico", path: "/driver/history", color: "text-primary" },
];

const DriverDashboard = () => {
  const navigate = useNavigate();
  const user = getAuthUser();

  const [status, setStatus] = useState<"parado" | "uso">("parado");
  const [loans, setLoans] = useState<any[]>([]);
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const done = localStorage.getItem("first_login_done_driver") === "1";

    if (!done) {
      navigate("/first-login?role=driver", { replace: true });
    }
  }, [navigate]);

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
      item.total_price ||
      Number(item.liters || 0) * Number(item.price_per_liter || 0)
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
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="glass-card p-4">
            <Fuel className="w-5 h-5 text-warning mb-2" />
            <p className="text-sm text-muted-foreground">Último Abastecimento</p>
            <p className="font-bold text-foreground">
              {lastFuel?.date ? new Date(lastFuel.date).toLocaleDateString("pt-BR") : "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {lastFuel
                ? `${lastFuel.liters}L • R$ ${lastFuel.cost.toFixed(2)}`
                : "Sem registros"}
            </p>
          </div>

          <div className="glass-card p-4">
            <Wrench className="w-5 h-5 text-info mb-2" />
            <p className="text-sm text-muted-foreground">Próx. Manutenção</p>
            <p className="font-bold text-foreground">
              {nextMaintenance?.dateLabel || "Sem registros"}
            </p>

            {nextMaintenance?.daysLabel ? (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-warning" />
                <p className="text-xs text-warning">{nextMaintenance.daysLabel}</p>
              </div>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <h2 className="text-lg font-semibold text-foreground px-1">
            Qual o status do veículo?
          </h2>

          <div className="bg-card border border-border rounded-2xl p-1.5 shadow-sm flex items-center">
            <button
              onClick={() => setStatus("parado")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 font-bold ${status === "parado"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/30"
                }`}
            >
              Parado
            </button>

            <button
              onClick={() => setStatus("uso")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 font-bold ${status === "uso"
                  ? "bg-success text-white shadow-lg"
                  : "text-muted-foreground hover:bg-secondary/30"
                }`}
            >
              <div
                className={`w-2 h-2 rounded-full bg-white ${status === "uso" ? "animate-pulse" : "hidden"
                  }`}
              />
              Em Uso
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-lg font-semibold text-foreground">
            Ações Rápidas
          </h2>

          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="w-full glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>

              <span className="text-lg font-medium text-foreground flex-1 text-left">
                {action.label}
              </span>

              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DriverDashboard;