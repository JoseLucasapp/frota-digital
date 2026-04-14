import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const DriverHistory = () => {
  const user = getAuthUser();
  const navigate = useNavigate();
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ data: any[] }>("/fueling", { limit: 200 }),
      api.get<{ data: any[] }>("/maintenances", { limit: 200 }),
    ])
      .then(([fuelingRes, maintenanceRes]) => {
        setFuelings(fuelingRes.data || []);
        setMaintenances(maintenanceRes.data || []);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar histórico'));
  }, []);

  const history = useMemo(() => [
    ...fuelings.map((item) => ({ id: `f-${item.id}`, type: 'Abastecimento', description: `${item.fuel_type} em ${item.station}`, date: item.created_at || item.date })),
    ...maintenances.map((item) => ({ id: `m-${item.id}`, type: 'Manutenção', description: item.description, date: item.created_at || item.updated_at })),
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()), [fuelings, maintenances]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div><div className="flex items-center gap-4 mb-1">
        <button onClick={() => navigate("/driver")} className="text-primary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Meu Histórico</h1>
      </div><p className="text-muted-foreground">{user?.name || 'Motorista'}</p></div>
      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      <div className="glass-card p-6 space-y-3">{history.map((item) => <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40"><Clock3 className="w-5 h-5 text-primary" /><div><p className="font-medium text-foreground">{item.type}</p><p className="text-sm text-muted-foreground">{item.description}</p><p className="text-xs text-muted-foreground">{item.date ? new Date(item.date).toLocaleString('pt-BR') : 'Sem data'}</p></div></div>)}{!history.length ? <p className="text-sm text-muted-foreground">Nenhum histórico encontrado.</p> : null}</div>
    </div>
  );
};

export default DriverHistory;