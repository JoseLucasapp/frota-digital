import { motion } from "framer-motion";
import {
  Car, Users, Fuel, Wrench, AlertTriangle, TrendingUp, MapPin, Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { dashboardStats, monthlyFuelData, vehicleTypeData, notifications, workOrders } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

const statCards = [
  { icon: Car, label: "Veículos Ativos", value: `${dashboardStats.activeVehicles}/${dashboardStats.totalVehicles}`, color: "text-primary" },
  { icon: Users, label: "Motoristas Ativos", value: `${dashboardStats.activeDrivers}/${dashboardStats.totalDrivers}`, color: "text-success" },
  { icon: Fuel, label: "Gasto Combustível", value: `R$ ${dashboardStats.totalFuelCost.toLocaleString("pt-BR")}`, color: "text-warning" },
  { icon: Wrench, label: "OS Pendentes", value: dashboardStats.pendingOrders.toString(), color: "text-destructive" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const AdminDashboard = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-lg mt-1">Visão geral da frota</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Gastos com Combustível</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyFuelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={14} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Custo"]}
              />
              <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Frota por Combustível</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={vehicleTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {vehicleTypeData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {vehicleTypeData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: d.fill }} />
                <span className="text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Alertas Recentes
          </h3>
          <div className="space-y-3">
            {notifications.filter(n => !n.read).map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  n.type === "document" ? "bg-warning" : n.type === "maintenance" ? "bg-info" : n.type === "fuel" ? "bg-destructive" : "bg-primary"
                }`} />
                <div>
                  <p className="font-medium text-foreground text-sm">{n.title}</p>
                  <p className="text-muted-foreground text-sm">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Work Orders */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Ordens de Serviço
          </h3>
          <div className="space-y-3">
            {workOrders.slice(0, 4).map((wo) => (
              <div key={wo.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground text-sm">{wo.vehiclePlate} — {wo.description}</p>
                  <p className="text-muted-foreground text-sm">{wo.type === "preventive" ? "Preventiva" : "Corretiva"}</p>
                </div>
                <Badge className={
                  wo.status === "completed" ? "bg-success/20 text-success border-0" :
                  wo.status === "in_progress" ? "bg-info/20 text-info border-0" :
                  "bg-warning/20 text-warning border-0"
                }>
                  {wo.status === "completed" ? "Concluída" : wo.status === "in_progress" ? "Em andamento" : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
