import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Car, Users, Fuel, Wrench, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";

const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [vehicleRes, driverRes, fuelingRes, maintenanceRes, notificationRes] = await Promise.all([
          api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
          api.get<{ data: any[] }>("/driver", { limit: 200 }),
          api.get<{ data: any[] }>("/fueling", { limit: 200 }),
          api.get<{ data: any[] }>("/maintenances", { limit: 200 }),
          api.get<{ data: any[] }>("/notifications", { limit: 50 }),
        ]);
        setVehicles(vehicleRes.data || []);
        setDrivers(driverRes.data || []);
        setFuelings(fuelingRes.data || []);
        setMaintenances(maintenanceRes.data || []);
        setNotifications(notificationRes.data || []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const activeVehicles = vehicles.filter((vehicle) => String(vehicle.status).toLowerCase() === 'active').length;
    const activeDrivers = drivers.filter((driver) => String(driver.status).toLowerCase() === 'active').length;
    const totalFuelCost = fuelings.reduce((sum, item) => sum + Number(item.total_price || Number(item.liters || 0) * Number(item.price_per_liter || 0)), 0);
    const pendingMaintenances = maintenances.filter((item) => String(item.status).toLowerCase().includes('pending')).length;

    return { activeVehicles, activeDrivers, totalFuelCost, pendingMaintenances };
  }, [vehicles, drivers, fuelings, maintenances]);

  const fuelByMonth = useMemo(() => {
    const monthMap = new Map<string, number>();
    fuelings.forEach((item) => {
      const sourceDate = item.created_at || item.date || new Date().toISOString();
      const month = new Date(sourceDate).toLocaleDateString('pt-BR', { month: 'short' });
      const total = Number(item.total_price || Number(item.liters || 0) * Number(item.price_per_liter || 0));
      monthMap.set(month, (monthMap.get(month) || 0) + total);
    });
    return Array.from(monthMap.entries()).map(([month, cost]) => ({ month, cost }));
  }, [fuelings]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-lg mt-1">Visão geral da frota</p>
      </div>

      {error ? <div className="glass-card p-4 text-destructive text-sm">{error}</div> : null}
      {loading ? <div className="glass-card p-6 text-muted-foreground">Carregando dashboard...</div> : null}

      {!loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Car, label: 'Veículos ativos', value: `${stats.activeVehicles}/${vehicles.length}` },
              { icon: Users, label: 'Motoristas ativos', value: `${stats.activeDrivers}/${drivers.length}` },
              { icon: Fuel, label: 'Gasto combustível', value: `R$ ${stats.totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { icon: Wrench, label: 'Manutenções pendentes', value: String(stats.pendingMaintenances) },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3"><stat.icon className="w-5 h-5 text-primary" /></div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Gastos com combustível</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={fuelByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={14} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} />
                  <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Custo']} />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" /> Alertas recentes</h3>
              <div className="space-y-3">
                {notifications.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${item.read ? 'bg-muted' : 'bg-primary'}`} />
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.title}</p>
                      <p className="text-muted-foreground text-sm">{item.message}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada.</p> : null}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ordens de serviço</h3>
            <div className="space-y-3">
              {maintenances.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground text-sm">{item.type || 'Manutenção'} — {item.description}</p>
                    <p className="text-muted-foreground text-sm">Veículo: {item.vehicle_id}</p>
                  </div>
                  <Badge>{item.status}</Badge>
                </div>
              ))}
              {maintenances.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma manutenção encontrada.</p> : null}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AdminDashboard;