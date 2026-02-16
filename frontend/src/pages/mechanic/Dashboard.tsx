import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wrench, LogOut, CheckCircle, Clock, AlertTriangle, FileText, Upload } from "lucide-react";
import { workOrders } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

const statusMap = {
  pending: { label: "Pendente", className: "bg-warning/20 text-warning border-0", icon: Clock },
  in_progress: { label: "Em andamento", className: "bg-info/20 text-info border-0", icon: Wrench },
  completed: { label: "Concluída", className: "bg-success/20 text-success border-0", icon: CheckCircle },
};

const MechanicDashboard = () => {
  const navigate = useNavigate();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    toast({ title: "Status atualizado!", description: `Ordem ${orderId} atualizada para ${newStatus}.` });
  };

  useEffect(() => {
    const done = localStorage.getItem("first_login_done_mechanic") === "1";

    if (!done) {
      navigate("/first-login?role=mechanic", { replace: true });
    }
  }, [navigate]);


  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-6 pb-16 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-base">Oficina</p>
            <h1 className="text-2xl font-bold text-primary-foreground">Auto Mecânica Silva</h1>
          </div>
          <button onClick={() => navigate("/login")} className="text-primary-foreground/80 hover:text-primary-foreground">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="px-4 -mt-10 pb-8 max-w-2xl mx-auto space-y-5">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-warning">{workOrders.filter(w => w.status === "pending").length}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-info">{workOrders.filter(w => w.status === "in_progress").length}</p>
            <p className="text-sm text-muted-foreground">Em andamento</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-success">{workOrders.filter(w => w.status === "completed").length}</p>
            <p className="text-sm text-muted-foreground">Concluídas</p>
          </div>
        </motion.div>

        {/* Work Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Ordens de Serviço</h2>
          <div className="space-y-4">
            {workOrders.map((wo) => {
              const StatusIcon = statusMap[wo.status].icon;
              return (
                <div key={wo.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{wo.description}</p>
                        <p className="text-sm text-muted-foreground font-mono">{wo.vehiclePlate} • {wo.type === "preventive" ? "Preventiva" : "Corretiva"}</p>
                      </div>
                    </div>
                    <Badge className={statusMap[wo.status].className}>{statusMap[wo.status].label}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>Custo: <strong className="text-foreground">R$ {wo.cost.toLocaleString("pt-BR")}</strong></span>
                    <span>{new Date(wo.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select defaultValue={wo.status} onValueChange={(v) => handleStatusChange(wo.id, v)}>
                      <SelectTrigger className="h-10 bg-secondary border-border flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="gap-1 h-10 border-border">
                      <Upload className="w-4 h-4" /> NF
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Documentos da Oficina</h2>
          <div className="space-y-3">
            {["CNPJ", "Alvará de Funcionamento", "Certificados"].map((doc) => (
              <div key={doc} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-info" />
                  <span className="font-medium text-foreground">{doc}</span>
                </div>
                <label className="text-sm text-primary cursor-pointer hover:underline">
                  Enviar
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
