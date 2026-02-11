import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Search, Plus } from "lucide-react";
import { vehicles as initialVehicles, drivers } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateModal from "@/components/CreateModal";
import ActionMenu from "@/components/ActionMenu";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusMap = {
  active: { label: "Ativo", className: "bg-success/20 text-success border-0" },
  maintenance: { label: "Manutenção", className: "bg-warning/20 text-warning border-0" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground border-0" },
  in_use: { label: "Em uso", className: "bg-info/20 text-info border-0" },
  stopped: { label: "Parado", className: "bg-destructive/20 text-destructive border-0" },
};

type VehicleStatus = keyof typeof statusMap;

const vehicleFields = [
  { label: "Placa", placeholder: "ABC-1D23" },
  { label: "Marca", placeholder: "Toyota" },
  { label: "Modelo", placeholder: "Hilux" },
  { label: "Ano", placeholder: "2024", type: "number" },
  { label: "Combustível", placeholder: "Diesel" },
  { label: "KM Atual", placeholder: "0", type: "number" },
];

const AdminVehicles = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState<string | null>(null);
  const [driverModal, setDriverModal] = useState<string | null>(null);

  const filtered = initialVehicles.filter(
    (v) => v.plate.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase())
  );

  const editVehicle = initialVehicles.find((v) => v.id === editModal);
  const driverVehicle = initialVehicles.find((v) => v.id === driverModal);

  const getActions = (v: typeof initialVehicles[0]) => [
    { label: "Editar veículo", onClick: () => setEditModal(v.id) },
    { label: v.driver ? "Trocar motorista" : "Designar motorista", onClick: () => setDriverModal(v.id) },
    ...(v.driver ? [{ label: "Remover motorista", onClick: () => toast({ title: "Motorista removido", description: `Motorista removido do veículo ${v.plate}` }), destructive: true }] : []),
    { label: "Excluir veículo", onClick: () => toast({ title: "Veículo excluído", description: `Veículo ${v.plate} removido.` }), destructive: true },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground text-lg">{initialVehicles.length} veículos cadastrados</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" /> Novo Veículo
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar por placa ou modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Veículo</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Placa</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Motorista</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">KM</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Operação</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{v.brand} {v.model}</p>
                      <p className="text-sm text-muted-foreground">{v.year} • {v.fuelType}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono font-semibold text-foreground">{v.plate}</td>
                <td className="p-4 text-foreground">{v.driver || "—"}</td>
                <td className="p-4 text-foreground">{v.km.toLocaleString("pt-BR")} km</td>
                <td className="p-4"><Badge className={statusMap[v.status].className}>{statusMap[v.status].label}</Badge></td>
                <td className="p-4">
                  <Badge className={v.moving ? "bg-info/20 text-info border-0" : "bg-muted text-muted-foreground border-0"}>
                    {v.moving ? "Em uso" : "Parado"}
                  </Badge>
                </td>
                <td className="p-4"><ActionMenu items={getActions(v)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((v) => (
          <div key={v.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Car className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="font-semibold text-foreground">{v.brand} {v.model}</p>
                  <p className="font-mono text-sm text-muted-foreground">{v.plate}</p>
                </div>
              </div>
              <ActionMenu items={getActions(v)} />
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={statusMap[v.status].className}>{statusMap[v.status].label}</Badge>
              <Badge className={v.moving ? "bg-info/20 text-info border-0" : "bg-muted text-muted-foreground border-0"}>
                {v.moving ? "Em uso" : "Parado"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Motorista: </span><span className="text-foreground">{v.driver || "—"}</span></div>
              <div><span className="text-muted-foreground">KM: </span><span className="text-foreground">{v.km.toLocaleString("pt-BR")}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && <CreateModal title="Novo Veículo" fields={vehicleFields} onClose={() => setShowModal(false)} successMessage="Veículo cadastrado!" />}

      {/* Edit Vehicle Modal */}
      {editVehicle && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="glass-card w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Editar Veículo — {editVehicle.plate}</h2>
              <button onClick={() => setEditModal(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-base">Placa</Label><Input defaultValue={editVehicle.plate} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Marca</Label><Input defaultValue={editVehicle.brand} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Modelo</Label><Input defaultValue={editVehicle.model} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Ano</Label><Input defaultValue={editVehicle.year.toString()} type="number" className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">Combustível</Label><Input defaultValue={editVehicle.fuelType} className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2"><Label className="text-base">KM</Label><Input defaultValue={editVehicle.km.toString()} type="number" className="h-12 text-base bg-secondary border-border" /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-base">Status</Label>
                <Select defaultValue={editVehicle.status}>
                  <SelectTrigger className="h-12 text-base bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => { toast({ title: "Veículo atualizado!" }); setEditModal(null); }} className="w-full h-12 text-base gradient-primary text-primary-foreground">Salvar</Button>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {driverVehicle && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDriverModal(null)}>
          <div className="glass-card w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Designar Motorista</h2>
              <button onClick={() => setDriverModal(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-muted-foreground">Veículo: <strong className="text-foreground">{driverVehicle.plate} — {driverVehicle.brand} {driverVehicle.model}</strong></p>
            {driverVehicle.driver && <p className="text-sm text-muted-foreground">Motorista atual: <strong className="text-foreground">{driverVehicle.driver}</strong></p>}
            <div className="space-y-2">
              <Label className="text-base">Selecionar Motorista</Label>
              <Select>
                <SelectTrigger className="h-12 text-base bg-secondary border-border"><SelectValue placeholder="Escolha um motorista" /></SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.status === "active").map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — CNH {d.cnhCategory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => { toast({ title: "Motorista designado!" }); setDriverModal(null); }} className="w-full h-12 text-base gradient-primary text-primary-foreground">Confirmar</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminVehicles;
