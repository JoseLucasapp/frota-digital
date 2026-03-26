import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wrench } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const DriverMaintenancePage = () => {
  const user = getAuthUser();
  const navigate = useNavigate();

  const [loans, setLoans] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
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
        setError(err instanceof ApiError ? err.message : "Erro ao carregar manutenções");
      }
    };

    load();
  }, []);

  const currentLoan = useMemo(() => {
    const ownLoans = loans.filter((loan) => loan.driver_id === user?.id);
    return ownLoans.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime())[0];
  }, [loans, user?.id]);

  const currentVehicle = useMemo(() => {
    return vehicles.find((vehicle) => vehicle.id === currentLoan?.vehicle_id) || null;
  }, [vehicles, currentLoan?.vehicle_id]);

  const myMaintenances = useMemo(() => {
    if (!currentVehicle?.id) return [];
    return maintenances.filter((item) => item.vehicle_id === currentVehicle.id);
  }, [maintenances, currentVehicle?.id]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate("/driver")} className="text-primary-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Manutenções</h1>
        </div>

        <p className="text-muted-foreground">
          {currentVehicle ? `Veículo atual: ${currentVehicle.plate}` : "Nenhum veículo associado"}
        </p>
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}

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
              {item.priority ? <Badge>{item.priority}</Badge> : null}
              {item.status ? <Badge>{item.status}</Badge> : null}
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
  );
};

export default DriverMaintenancePage;