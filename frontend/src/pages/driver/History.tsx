import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Fuel, Wrench } from "lucide-react";
import { fuelLogs, workOrders } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DriverHistory = () => {
  const navigate = useNavigate();
  const myFuelLogs = fuelLogs.filter((f) => f.driverId === "d1");
  const myWorkOrders = workOrders.filter((w) => w.vehicleId === "v1");

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-4 flex items-center gap-3">
        <button onClick={() => navigate("/driver")} className="text-primary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary-foreground">Histórico</h1>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 max-w-lg mx-auto">
        <Tabs defaultValue="fuel" className="w-full">
          <TabsList className="w-full h-12 bg-secondary">
            <TabsTrigger value="fuel" className="flex-1 text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Abastecimentos</TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-1 text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Manutenções</TabsTrigger>
          </TabsList>

          <TabsContent value="fuel" className="mt-4 space-y-3">
            {myFuelLogs.map((f) => (
              <div key={f.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-warning" />
                    <span className="font-semibold text-foreground">{f.fuelType}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{new Date(f.date).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{f.liters}L • {f.station}</span>
                  <span className="text-lg font-bold text-foreground">R$ {f.cost.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {myFuelLogs.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado.</p>}
          </TabsContent>

          <TabsContent value="maintenance" className="mt-4 space-y-3">
            {myWorkOrders.map((wo) => (
              <div key={wo.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-info" />
                    <span className="font-semibold text-foreground">{wo.description}</span>
                  </div>
                  <Badge className={
                    wo.status === "completed" ? "bg-success/20 text-success border-0" :
                    wo.status === "in_progress" ? "bg-info/20 text-info border-0" :
                    "bg-warning/20 text-warning border-0"
                  }>
                    {wo.status === "completed" ? "Concluída" : wo.status === "in_progress" ? "Em andamento" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{wo.type === "preventive" ? "Preventiva" : "Corretiva"}</span>
                  <span className="text-foreground font-semibold">R$ {wo.cost.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            ))}
            {myWorkOrders.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado.</p>}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default DriverHistory;
