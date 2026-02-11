import { useState } from "react";
import { motion } from "framer-motion";
import { Fuel, Search, Plus } from "lucide-react";
import { fuelLogs } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreateModal from "@/components/CreateModal";

const fuelFields = [
  { label: "Veículo (Placa)", placeholder: "ABC-1D23" },
  { label: "Motorista", placeholder: "Nome do motorista" },
  { label: "Data", placeholder: "", type: "date" },
  { label: "Combustível", placeholder: "Diesel, Gasolina, Etanol" },
  { label: "Litros", placeholder: "0", type: "number" },
  { label: "Valor (R$)", placeholder: "0.00", type: "number" },
  { label: "KM Atual", placeholder: "0", type: "number" },
  { label: "Posto", placeholder: "Nome do posto" },
];

const AdminFuel = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const filtered = fuelLogs.filter(
    (f) => f.vehiclePlate.toLowerCase().includes(search.toLowerCase()) || f.driverName.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = fuelLogs.reduce((a, b) => a + b.cost, 0);
  const totalLiters = fuelLogs.reduce((a, b) => a + b.liters, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Abastecimentos</h1>
          <p className="text-muted-foreground text-lg">{fuelLogs.length} registros</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" /> Novo Registro
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Total Gasto</p>
          <p className="text-2xl font-bold text-foreground mt-1">R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Litros Totais</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalLiters.toLocaleString("pt-BR")} L</p>
        </div>
        <div className="glass-card p-5 col-span-2 lg:col-span-1">
          <p className="text-sm text-muted-foreground">Custo Médio/Litro</p>
          <p className="text-2xl font-bold text-foreground mt-1">R$ {(totalCost / totalLiters).toFixed(2)}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar por placa ou motorista..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
      </div>

      <div className="hidden md:block glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Data</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Veículo</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Motorista</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Combustível</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Litros</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Valor</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">KM</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-4 text-foreground">{new Date(f.date).toLocaleDateString("pt-BR")}</td>
                <td className="p-4 font-mono font-semibold text-foreground">{f.vehiclePlate}</td>
                <td className="p-4 text-foreground">{f.driverName}</td>
                <td className="p-4 text-foreground">{f.fuelType}</td>
                <td className="p-4 text-foreground">{f.liters} L</td>
                <td className="p-4 font-semibold text-foreground">R$ {f.cost.toFixed(2)}</td>
                <td className="p-4 text-foreground">{f.km.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((f) => (
          <div key={f.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-foreground">{f.vehiclePlate}</span>
              </div>
              <span className="text-sm text-muted-foreground">{new Date(f.date).toLocaleDateString("pt-BR")}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{f.driverName} • {f.station}</p>
            <div className="flex items-center justify-between">
              <span className="text-foreground">{f.liters}L {f.fuelType}</span>
              <span className="text-lg font-bold text-foreground">R$ {f.cost.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && <CreateModal title="Novo Abastecimento" fields={fuelFields} onClose={() => setShowModal(false)} successMessage="Abastecimento registrado!" />}
    </motion.div>
  );
};

export default AdminFuel;
