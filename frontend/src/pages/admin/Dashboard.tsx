import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Car, Users, Fuel, Wrench, AlertTriangle, MapPin, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { isNotificationRead } from "@/lib/notifications";
import { translateMaintenanceStatus } from "@/lib/formatters";

const removeRawLinks = (value?: string | null) =>
  String(value || "")
    .split(/\n+/)
    .filter((line) => !/google maps\s*:/i.test(line) && !/https?:\/\//i.test(line))
    .join(" ")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const getNotificationIcon = (notification: any) => {
  const text = `${notification.type || ""} ${notification.title || ""} ${notification.message || ""}`.toLowerCase();

  if (text.includes("rastream") || text.includes("localiza") || text.includes("parada")) return MapPin;
  if (text.includes("abastec") || text.includes("combust")) return Fuel;
  if (text.includes("manuten") || text.includes("mecân") || text.includes("mecan")) return Wrench;
  if (text.includes("document")) return FileText;

  return AlertTriangle;
};

const getNotificationRoute = (notification: any) => {
  const text = `${notification.type || ""} ${notification.title || ""} ${notification.message || ""}`.toLowerCase();
  const message = String(notification.message || "");

  if (text.includes("rastream") || text.includes("localiza") || text.includes("parada")) {
    const params = new URLSearchParams();
    const vehicleId = notification.vehicle_id || notification.vehicleId;
    const trackingId = notification.tracking_log_id || notification.trackingLogId || notification.entity_id;
    const plateMatch = message.match(/de\s+([^\n.]+?)(?:\s+-|\.\s+Local:|\s+Local:)/i);

    if (vehicleId) params.set("vehicle_id", String(vehicleId));
    if (trackingId) params.set("tracking_id", String(trackingId));
    if (!vehicleId && plateMatch?.[1]) params.set("busca", plateMatch[1].trim());

    const query = params.toString();
    return `/admin/tracking${query ? `?${query}` : ""}`;
  }

  if (text.includes("abastec") || text.includes("combust") || notification.type === "fuel") {
    const id = notification.fueling_id || notification.fuelingId || notification.entity_id;
    return `/admin/fuel${id ? `?highlight=${encodeURIComponent(String(id))}` : ""}`;
  }

  if (text.includes("manuten") || notification.type === "maintenance") {
    const id = notification.maintenance_id || notification.maintenanceId || notification.entity_id;
    return `/admin/maintenance${id ? `?highlight=${encodeURIComponent(String(id))}` : ""}`;
  }

  if (text.includes("document")) return "/admin/drivers";

  return "/admin";
};

const getNotificationTitle = (notification: any) => {
  const title = String(notification.title || "Alerta").trim();
  const text = `${notification.type || ""} ${title} ${notification.message || ""}`.toLowerCase();

  if (text.includes("rastream") || text.includes("localiza")) return "Rastreamento atualizado";
  if (text.includes("parada")) return "Parada registrada";
  if (text.includes("abastec") || text.includes("combust")) return "Abastecimento registrado";
  if (text.includes("manuten") || text.includes("mecân") || text.includes("mecan")) return title;

  return title;
};

const getNotificationDescription = (notification: any) => {
  const cleaned = removeRawLinks(notification.message);
  if (!cleaned) return "Clique para ver os detalhes.";

  return cleaned
    .replace(/\.\s*Local:/i, " • Local:")
    .replace(/Google Maps:.*/i, "")
    .trim();
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.75rem",
  color: "hsl(var(--foreground))",
  boxShadow: "0 12px 30px hsl(var(--background) / 0.35)",
};

const tooltipLabelStyle = { color: "hsl(var(--foreground))", fontWeight: 600 };
const tooltipItemStyle = { color: "hsl(var(--foreground))" };

const AdminDashboard = () => {
  const navigate = useNavigate();
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
        setError(err instanceof ApiError ? err.message : "Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const activeVehicles = vehicles.filter((vehicle) => String(vehicle.status).toLowerCase() === "active").length;
    const activeDrivers = drivers.filter((driver) => String(driver.status).toLowerCase() === "active").length;
    const totalFuelCost = fuelings.reduce((sum, item) => sum + Number(item.total_price || Number(item.liters || 0) * Number(item.price_per_liter || 0)), 0);
    const pendingMaintenances = maintenances.filter((item) => String(item.status).toLowerCase().includes("pending")).length;

    return { activeVehicles, activeDrivers, totalFuelCost, pendingMaintenances };
  }, [vehicles, drivers, fuelings, maintenances]);

  const fuelByMonth = useMemo(() => {
    const monthMap = new Map<string, number>();
    fuelings.forEach((item) => {
      const sourceDate = item.created_at || item.date || new Date().toISOString();
      const month = new Date(sourceDate).toLocaleDateString("pt-BR", { month: "short" });
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
              { icon: Car, label: "Veículos ativos", value: `${stats.activeVehicles}/${vehicles.length}` },
              { icon: Users, label: "Motoristas ativos", value: `${stats.activeDrivers}/${drivers.length}` },
              { icon: Fuel, label: "Gasto combustível", value: `R$ ${stats.totalFuelCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
              { icon: Wrench, label: "Manutenções pendentes", value: String(stats.pendingMaintenances) },
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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Custo"]}
                  />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" /> Alertas recentes</h3>
              <div className="space-y-3">
                {notifications.slice(0, 6).map((item) => {
                  const Icon = getNotificationIcon(item);
                  const route = getNotificationRoute(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(route)}
                      className="flex w-full items-start gap-3 rounded-xl bg-secondary/50 p-3 text-left transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isNotificationRead(item) ? "bg-muted" : "bg-primary"}`} />
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{getNotificationTitle(item)}</p>
                        <p className="text-muted-foreground text-sm line-clamp-2">{getNotificationDescription(item)}</p>
                        <p className="mt-1 text-xs font-medium text-primary">Clique para abrir</p>
                      </div>
                    </button>
                  );
                })}
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
                    <p className="font-medium text-foreground text-sm">{item.type || "Manutenção"} — {item.description}</p>
                    <p className="text-muted-foreground text-sm">Veículo: {item.vehicle_id}</p>
                  </div>
                  <Badge>{translateMaintenanceStatus(item.status)}</Badge>
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
