import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Car, Fuel, Wrench, FileText, Clock, LogOut, ChevronRight, AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const mockDriverData = {
  name: "Carlos Silva",
  vehicle: { plate: "ABC-1D23", model: "Toyota Hilux SW4", year: 2023, km: 45230, status: "active" as const },
  lastFuel: { date: "10/01/2024", liters: 65, cost: 389.35 },
  nextMaintenance: "15/02/2024",
};

const quickActions = [
  { icon: Fuel, label: "Registrar Abastecimento", path: "/driver/fuel", color: "text-warning" },
  { icon: Wrench, label: "Reportar Problema", path: "/driver/maintenance", color: "text-destructive" },
  { icon: FileText, label: "Meus Documentos", path: "/driver/documents", color: "text-info" },
  { icon: Clock, label: "Histórico", path: "/driver/history", color: "text-primary" },
];

const DriverDashboard = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<"parado" | "uso">("parado");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary p-6 pb-16 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-base">Bem-vindo,</p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {mockDriverData.name}
            </h1>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="text-primary-foreground/80 hover:text-primary-foreground"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="px-4 -mt-10 pb-8 max-w-lg mx-auto space-y-5">
        {/* Vehicle Card */}
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
                {mockDriverData.vehicle.model}
              </p>
              <p className="font-mono text-primary text-lg font-semibold">
                {mockDriverData.vehicle.plate}
              </p>
            </div>
            <Badge className="bg-success/20 text-success border-0">Ativo</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">KM Atual</p>
              <p className="text-lg font-bold text-foreground">
                {mockDriverData.vehicle.km.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">Ano</p>
              <p className="text-lg font-bold text-foreground">
                {mockDriverData.vehicle.year}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="glass-card p-4">
            <Fuel className="w-5 h-5 text-warning mb-2" />
            <p className="text-sm text-muted-foreground">
              Último Abastecimento
            </p>
            <p className="font-bold text-foreground">
              {mockDriverData.lastFuel.date}
            </p>
            <p className="text-sm text-muted-foreground">
              {mockDriverData.lastFuel.liters}L • R${" "}
              {mockDriverData.lastFuel.cost.toFixed(2)}
            </p>
          </div>
          <div className="glass-card p-4">
            <Wrench className="w-5 h-5 text-info mb-2" />
            <p className="text-sm text-muted-foreground">Próx. Manutenção</p>
            <p className="font-bold text-foreground">
              {mockDriverData.nextMaintenance}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <p className="text-xs text-warning">Em 35 dias</p>
            </div>
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 font-bold ${
                status === "parado"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/30"
              }`}
            >
              Parado
            </button>

            <button
              onClick={() => setStatus("uso")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 font-bold ${
                status === "uso"
                  ? "bg-success text-white shadow-lg"
                  : "text-muted-foreground hover:bg-secondary/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full bg-white ${status === "uso" ? "animate-pulse" : "hidden"}`}
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
