import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Search, Plus, X } from "lucide-react";
import { mechanics } from "@/lib/mockData";
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
};

const mechanicFields = [
  { label: "Nome", placeholder: "Nome da oficina" },
  { label: "CNPJ", placeholder: "00.000.000/0000-00" },
  { label: "Email", placeholder: "email@oficina.com" },
  { label: "Telefone", placeholder: "(00) 0000-0000" },
  { label: "Endereço", placeholder: "Endereço completo", colSpan: true },
  { label: "Especialidades", placeholder: "Motor, Freios, Elétrica...", colSpan: true },
];

const AdminMechanics = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState<string | null>(null);

  const filtered = mechanics.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.cnpj.includes(search)
  );

  const editMechanic = mechanics.find((m) => m.id === editModal);

  const getActions = (m: typeof mechanics[0]) => [
    { label: "Editar oficina", onClick: () => setEditModal(m.id) },
    { label: m.status === "active" ? "Desativar" : "Ativar", onClick: () => toast({ title: m.status === "active" ? "Oficina desativada" : "Oficina ativada", description: m.name }) },
    { label: "Excluir oficina", onClick: () => toast({ title: "Oficina excluída", description: m.name }), destructive: true },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mecânicos / Oficinas</h1>
          <p className="text-muted-foreground text-lg">{mechanics.length} cadastrados</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" /> Nova Oficina
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
      </div>

      <div className="hidden md:block glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Oficina</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">CNPJ</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Telefone</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Especialidades</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-foreground">{m.cnpj}</td>
                <td className="p-4 text-foreground">{m.phone}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {m.specialties.map((s) => (
                      <Badge key={s} className="bg-secondary text-muted-foreground border-0 text-xs">{s}</Badge>
                    ))}
                  </div>
                </td>
                <td className="p-4"><Badge className={statusMap[m.status].className}>{statusMap[m.status].label}</Badge></td>
                <td className="p-4"><ActionMenu items={getActions(m)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.phone}</p>
                </div>
              </div>
              <ActionMenu items={getActions(m)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {m.specialties.map((s) => (
                  <Badge key={s} className="bg-secondary text-muted-foreground border-0 text-xs">{s}</Badge>
                ))}
              </div>
              <Badge className={statusMap[m.status].className}>{statusMap[m.status].label}</Badge>
            </div>
          </div>
        ))}
      </div>

      {showModal && <CreateModal title="Nova Oficina" fields={mechanicFields} onClose={() => setShowModal(false)} successMessage="Oficina cadastrada!" />}

      {/* Edit Mechanic Modal */}
      {editMechanic && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="glass-card w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Editar Oficina</h2>
              <button onClick={() => setEditModal(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-base">Nome</Label><Input defaultValue={editMechanic.name} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">CNPJ</Label><Input defaultValue={editMechanic.cnpj} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Email</Label><Input defaultValue={editMechanic.email} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Telefone</Label><Input defaultValue={editMechanic.phone} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2 sm:col-span-2"><Label className="text-base">Endereço</Label><Input defaultValue={editMechanic.address} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-base">Status</Label>
                <Select defaultValue={editMechanic.status}>
                  <SelectTrigger className="h-12 text-base bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => { toast({ title: "Oficina atualizada!" }); setEditModal(null); }} className="w-full h-12 text-base gradient-primary text-primary-foreground">Salvar</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminMechanics;
