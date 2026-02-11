import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Plus, Calendar, User, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateModal from "@/components/CreateModal";

const loans = [
  { id: "l1", vehicle: "DEF-4G56 — Fiat Strada", borrower: "Secretaria de Saúde", dateOut: "2024-01-10", dateReturn: "2024-01-15", reason: "Campanha de vacinação", status: "returned" as const },
  { id: "l2", vehicle: "STU-9L01 — VW Amarok", borrower: "Secretaria de Obras", dateOut: "2024-01-12", dateReturn: null, reason: "Vistoria de estradas", status: "active" as const },
  { id: "l3", vehicle: "MNO-3J45 — Ford Ranger", borrower: "Defesa Civil", dateOut: "2024-01-14", dateReturn: "2024-01-16", reason: "Atendimento emergencial", status: "returned" as const },
];

const statusMap = {
  active: { label: "Em uso", className: "bg-info/20 text-info border-0" },
  returned: { label: "Devolvido", className: "bg-success/20 text-success border-0" },
  overdue: { label: "Atrasado", className: "bg-destructive/20 text-destructive border-0" },
};

const loanFields = [
  { label: "Veículo (Placa)", placeholder: "ABC-1D23" },
  { label: "Responsável", placeholder: "Nome ou setor" },
  { label: "Data Saída", placeholder: "", type: "date" },
  { label: "Data Retorno Prevista", placeholder: "", type: "date" },
  { label: "Motivo", placeholder: "Motivo do empréstimo", colSpan: true },
];

const AdminLoans = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = loans.filter((l) => {
    const matchSearch = l.vehicle.toLowerCase().includes(search.toLowerCase()) || l.borrower.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Empréstimos e Cessões</h1>
          <p className="text-muted-foreground text-lg">{loans.length} registros</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" /> Novo Empréstimo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Buscar por veículo ou responsável..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
        </div>
        <div className="flex gap-2">
          {[{ value: "all", label: "Todos" }, { value: "active", label: "Em uso" }, { value: "returned", label: "Devolvido" }].map((opt) => (
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

      <div className="space-y-4">
        {filtered.map((loan) => (
          <div key={loan.id} className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{loan.vehicle}</p>
                  <p className="text-sm text-muted-foreground">{loan.reason}</p>
                </div>
              </div>
              <Badge className={statusMap[loan.status].className}>{statusMap[loan.status].label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {loan.borrower}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Saída: {new Date(loan.dateOut).toLocaleDateString("pt-BR")}</span>
              {loan.dateReturn && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Retorno: {new Date(loan.dateReturn).toLocaleDateString("pt-BR")}</span>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum empréstimo encontrado.</p>}
      </div>

      {showModal && <CreateModal title="Novo Empréstimo" fields={loanFields} onClose={() => setShowModal(false)} successMessage="Empréstimo registrado!" />}
    </motion.div>
  );
};

export default AdminLoans;
