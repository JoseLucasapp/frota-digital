import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Plus, Search } from "lucide-react";
import { workOrders } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateModal from "@/components/CreateModal";

const statusMap = {
  pending: { label: "Pendente", className: "bg-warning/20 text-warning border-0" },
  in_progress: { label: "Em andamento", className: "bg-info/20 text-info border-0" },
  completed: { label: "Concluída", className: "bg-success/20 text-success border-0" },
};

const priorityMap = {
  low: { label: "Baixa", className: "bg-muted text-muted-foreground border-0" },
  medium: { label: "Média", className: "bg-warning/20 text-warning border-0" },
  high: { label: "Alta", className: "bg-destructive/20 text-destructive border-0" },
};

const osFields = [
  { label: "Veículo (Placa)", placeholder: "ABC-1D23" },
  { label: "Tipo", placeholder: "Preventiva ou Corretiva" },
  { label: "Descrição", placeholder: "Descreva o serviço", colSpan: true },
  { label: "Prioridade", placeholder: "Baixa, Média ou Alta" },
  { label: "Custo Estimado (R$)", placeholder: "0.00", type: "number" },
  { label: "Oficina", placeholder: "Nome da oficina" },
];

const AdminMaintenance = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = workOrders.filter((wo) => {
    const matchSearch = wo.vehiclePlate.toLowerCase().includes(search.toLowerCase()) || wo.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || wo.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Manutenções</h1>
          <p className="text-muted-foreground text-lg">{workOrders.length} ordens de serviço</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" /> Nova OS
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Buscar por placa ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
        </div>
        <div className="flex gap-2">
          {[{ value: "all", label: "Todos" }, { value: "pending", label: "Pendente" }, { value: "in_progress", label: "Em andamento" }, { value: "completed", label: "Concluída" }].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === opt.value ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((wo) => (
          <div key={wo.id} className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{wo.description}</p>
                  <p className="text-sm text-muted-foreground font-mono">{wo.vehiclePlate} • {wo.type === "preventive" ? "Preventiva" : "Corretiva"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={priorityMap[wo.priority].className}>{priorityMap[wo.priority].label}</Badge>
                <Badge className={statusMap[wo.status].className}>{statusMap[wo.status].label}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Custo: <strong className="text-foreground">R$ {wo.cost.toLocaleString("pt-BR")}</strong></span>
              {wo.mechanic && <span>Oficina: <strong className="text-foreground">{wo.mechanic}</strong></span>}
              <span>Criado em: {new Date(wo.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma OS encontrada.</p>}
      </div>

      {showModal && <CreateModal title="Nova Ordem de Serviço" fields={osFields} onClose={() => setShowModal(false)} successMessage="OS criada!" />}
    </motion.div>
  );
};

export default AdminMaintenance;
