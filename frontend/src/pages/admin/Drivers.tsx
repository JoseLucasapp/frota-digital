import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Plus, AlertTriangle, X } from "lucide-react";
import { drivers } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateModal from "@/components/CreateModal";
import ActionMenu from "@/components/ActionMenu";
import { toast } from "@/hooks/use-toast";

const statusMap = {
  active: { label: "Ativo", className: "bg-success/20 text-success border-0" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground border-0" },
  suspended: { label: "Suspenso", className: "bg-destructive/20 text-destructive border-0" },
};

const driverFields = [
  { label: "Nome Completo", placeholder: "Nome do motorista" },
  { label: "CPF", placeholder: "000.000.000-00" },
  { label: "Email", placeholder: "email@exemplo.com" },
  { label: "Telefone", placeholder: "(00) 00000-0000" },
  { label: "Categoria CNH", placeholder: "B, C, D ou E" },
  { label: "Validade CNH", placeholder: "2025-12-31", type: "date" },
];

const AdminDrivers = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState<string | null>(null);

  const filtered = drivers.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.cpf.includes(search)
  );

  const isExpiringSoon = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return diff < 60 * 24 * 60 * 60 * 1000;
  };

  const editDriver = drivers.find((d) => d.id === editModal);

  const getActions = (d: typeof drivers[0]) => [
    { label: "Editar motorista", onClick: () => setEditModal(d.id) },
    { label: d.status === "suspended" ? "Reativar" : "Suspender", onClick: () => toast({ title: d.status === "suspended" ? "Motorista reativado" : "Motorista suspenso", description: d.name }) },
    { label: "Excluir motorista", onClick: () => toast({ title: "Motorista excluído", description: d.name }), destructive: true },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Motoristas</h1>
          <p className="text-muted-foreground text-lg">{drivers.length} motoristas cadastrados</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" /> Novo Motorista
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
      </div>

      <div className="hidden md:block glass-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Motorista</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">CPF</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">CNH</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Telefone</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{d.name}</p>
                      <p className="text-sm text-muted-foreground">{d.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-foreground">{d.cpf}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">Cat. {d.cnhCategory}</span>
                    {isExpiringSoon(d.cnhExpiry) && <AlertTriangle className="w-4 h-4 text-warning" />}
                  </div>
                  <p className="text-sm text-muted-foreground">Venc: {new Date(d.cnhExpiry).toLocaleDateString("pt-BR")}</p>
                </td>
                <td className="p-4 text-foreground">{d.phone}</td>
                <td className="p-4"><Badge className={statusMap[d.status].className}>{statusMap[d.status].label}</Badge></td>
                <td className="p-4"><ActionMenu items={getActions(d)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((d) => (
          <div key={d.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="text-sm text-muted-foreground">{d.phone}</p>
                </div>
              </div>
              <ActionMenu items={getActions(d)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-2 text-sm flex-1">
                <div><span className="text-muted-foreground">CNH: </span><span className="text-foreground">Cat. {d.cnhCategory}</span></div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Venc: </span>
                  <span className="text-foreground">{new Date(d.cnhExpiry).toLocaleDateString("pt-BR")}</span>
                  {isExpiringSoon(d.cnhExpiry) && <AlertTriangle className="w-3 h-3 text-warning" />}
                </div>
              </div>
              <Badge className={statusMap[d.status].className}>{statusMap[d.status].label}</Badge>
            </div>
          </div>
        ))}
      </div>

      {showModal && <CreateModal title="Novo Motorista" fields={driverFields} onClose={() => setShowModal(false)} successMessage="Motorista cadastrado!" />}

      {/* Edit Driver Modal */}
      {editDriver && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="glass-card w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Editar Motorista</h2>
              <button onClick={() => setEditModal(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-base">Nome</Label><Input defaultValue={editDriver.name} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">CPF</Label><Input defaultValue={editDriver.cpf} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Email</Label><Input defaultValue={editDriver.email} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Telefone</Label><Input defaultValue={editDriver.phone} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Categoria CNH</Label><Input defaultValue={editDriver.cnhCategory} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Validade CNH</Label><Input defaultValue={editDriver.cnhExpiry} type="date" className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-base">Status</Label>
                <Select defaultValue={editDriver.status}>
                  <SelectTrigger className="h-12 text-base bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => { toast({ title: "Motorista atualizado!" }); setEditModal(null); }} className="w-full h-12 text-base gradient-primary text-primary-foreground">Salvar</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDrivers;
