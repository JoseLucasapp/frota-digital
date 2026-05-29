import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wrench } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { translateMaintenancePriority, translateMaintenanceStatus } from "@/lib/formatters";

const initialForm = {
  type: "",
  description: "",
  priority: "MEDIUM",
  estimated_cost: "",
  current_km: "",
};

const formatMaintenanceError = (err: unknown, fallback: string) => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
};

const DriverMaintenancePage = () => {
  const user = getAuthUser();
  const navigate = useNavigate();

  const [loans, setLoans] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    try {
      setBootLoading(true);
      setError(null);

      const [loanRes, vehicleRes, maintenanceRes] = await Promise.all([
        api.get<{ data: any[] }>("/loans", { limit: 200 }),
        api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
        api.get<{ data: any[] }>("/maintenances", { limit: 200 }),
      ]);

      setLoans(loanRes.data || []);
      setVehicles(vehicleRes.data || []);
      setMaintenances(maintenanceRes.data || []);
    } catch (err) {
      setError(formatMaintenanceError(err, "Erro ao carregar manutenções"));
    } finally {
      setBootLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const currentLoan = useMemo(() => {
    const ownLoans = loans.filter((loan) => loan.driver_id === user?.id);
    return ownLoans.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime())[0];
  }, [loans, user?.id]);

  const currentVehicle = useMemo(() => {
    return vehicles.find((vehicle) => vehicle.id === currentLoan?.vehicle_id) || null;
  }, [vehicles, currentLoan?.vehicle_id]);

  useEffect(() => {
    if (!currentVehicle) return;
    setForm((current) => ({
      ...current,
      current_km:
        currentVehicle.current_km != null && currentVehicle.current_km !== ""
          ? String(currentVehicle.current_km)
          : current.current_km,
    }));
  }, [currentVehicle]);

  const myMaintenances = useMemo(() => {
    if (!currentVehicle?.id) return [];
    return maintenances.filter((item) => item.vehicle_id === currentVehicle.id);
  }, [maintenances, currentVehicle?.id]);

  const submitReport = async () => {
    if (!currentVehicle?.id) {
      setError("Nenhum veículo associado ao motorista.");
      setMessage(null);
      return;
    }

    if (!form.description.trim()) {
      setError("Descreva o problema antes de enviar.");
      setMessage(null);
      return;
    }

    const previousKm = Number(currentVehicle.current_km || 0);
    const nextKm = Number(form.current_km || 0);
    if (!Number.isFinite(nextKm) || nextKm < previousKm) {
      setError(`A quilometragem atual deve ser maior ou igual a ${previousKm}.`);
      setMessage(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      await api.post("/maintenances", {
        vehicle_id: currentVehicle.id,
        type: form.type.trim() || "Problema reportado",
        description: form.description.trim(),
        priority: form.priority,
        status: "PENDING",
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined,
        current_km: form.current_km ? Number(form.current_km) : undefined,
      });

      setForm(initialForm);
      setMessage("Problema reportado com sucesso.");
      await load();
    } catch (err) {
      setError(formatMaintenanceError(err, "Erro ao reportar problema"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate("/driver")} className="text-primary-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Manutenções</h1>
        </div>
      </div>

      {bootLoading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando...</div> : null}
      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {message ? <div className="glass-card p-4 text-sm text-green-600">{message}</div> : null}

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Reportar problema</h2>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input
              value={form.type}
              onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}
              placeholder="Ex.: Barulho, pneu, freio..."
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <select
              value={form.priority}
              onChange={(e) => setForm((current) => ({ ...current, priority: e.target.value }))}
              className="h-12 w-full rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Custo estimado</Label>
            <Input
              type="number"
              value={form.estimated_cost}
              onChange={(e) => setForm((current) => ({ ...current, estimated_cost: e.target.value }))}
              placeholder="Opcional"
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>KM atual</Label>
            <Input
              type="number"
              value={form.current_km}
              onChange={(e) => setForm((current) => ({ ...current, current_km: e.target.value }))}
              placeholder="Preenchido pelo veículo"
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição do problema</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              placeholder="Descreva o que aconteceu"
              className="min-h-28 bg-secondary border-border"
            />
          </div>

          <Button
            disabled={loading || !currentVehicle}
            onClick={submitReport}
            className="w-full h-12 text-base gradient-primary text-primary-foreground"
          >
            {loading ? "Enviando..." : "Reportar problema"}
          </Button>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Histórico de manutenção</h2>

          {myMaintenances.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-secondary/40">
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-5 h-5 text-primary" />
                <p className="font-medium text-foreground">{item.type || "Manutenção"}</p>
              </div>

              <p className="text-sm text-muted-foreground">{item.description || "Sem descrição"}</p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {item.priority ? <Badge>{translateMaintenancePriority(item.priority)}</Badge> : null}
                {item.status ? <Badge>{translateMaintenanceStatus(item.status)}</Badge> : null}
              </div>

              {item.estimated_cost ? (
                <p className="text-sm text-muted-foreground mt-3">
                  Custo estimado: R$ {Number(item.estimated_cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              ) : null}

              {item.receipt_url ? (
                <a
                  href={item.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 text-sm text-primary hover:underline"
                >
                  Ver comprovante
                </a>
              ) : null}
            </div>
          ))}

          {!myMaintenances.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma manutenção encontrada.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DriverMaintenancePage;
