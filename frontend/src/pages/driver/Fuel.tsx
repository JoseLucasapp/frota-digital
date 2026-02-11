import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Fuel, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const DriverFuel = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    fuelType: "",
    liters: "",
    cost: "",
    km: "",
    station: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Abastecimento registrado!", description: "Os dados foram salvos com sucesso." });
    navigate("/driver");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-4 flex items-center gap-3">
        <button onClick={() => navigate("/driver")} className="text-primary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary-foreground">Registrar Abastecimento</h1>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 max-w-lg mx-auto">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Fuel className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="font-bold text-foreground">Toyota Hilux SW4</p>
              <p className="font-mono text-primary">ABC-1D23</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-base">Data / Hora</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-12 text-base bg-secondary border-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Tipo de Combustível</Label>
              <Select onValueChange={(v) => setForm({ ...form, fuelType: v })}>
                <SelectTrigger className="h-12 text-base bg-secondary border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="gasolina">Gasolina</SelectItem>
                  <SelectItem value="etanol">Etanol</SelectItem>
                  <SelectItem value="gnv">GNV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base">Litros</Label>
                <Input type="number" placeholder="0.0" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} className="h-12 text-base bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Valor (R$)</Label>
                <Input type="number" placeholder="0.00" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="h-12 text-base bg-secondary border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">KM Atual</Label>
              <Input type="number" placeholder="45.230" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} className="h-12 text-base bg-secondary border-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Posto</Label>
              <Input placeholder="Nome do posto" value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} className="h-12 text-base bg-secondary border-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Comprovante (foto)</Label>
              <label className="flex items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-border bg-secondary/50 cursor-pointer hover:border-primary transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-muted-foreground text-base">Tirar foto ou anexar</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity">
              Salvar Abastecimento
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DriverFuel;
