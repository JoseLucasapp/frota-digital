import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Wrench, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const DriverMaintenance = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Problema reportado!", description: "A equipe de manutenção foi notificada." });
    navigate("/driver");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-4 flex items-center gap-3">
        <button onClick={() => navigate("/driver")} className="text-primary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary-foreground">Reportar Problema</h1>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 max-w-lg mx-auto">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Wrench className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="font-bold text-foreground">Toyota Hilux SW4</p>
              <p className="font-mono text-primary">ABC-1D23</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-base">Descrição do Problema</Label>
              <Textarea placeholder="Descreva o problema com detalhes..." className="min-h-[120px] text-base bg-secondary border-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Prioridade</Label>
              <Select>
                <SelectTrigger className="h-12 text-base bg-secondary border-border">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa — Pode esperar</SelectItem>
                  <SelectItem value="medium">Média — Precisa de atenção</SelectItem>
                  <SelectItem value="high">Alta — Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base">KM Atual</Label>
              <Input type="number" placeholder="45.230" className="h-12 text-base bg-secondary border-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Fotos / Anexos</Label>
              <label className="flex items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-border bg-secondary/50 cursor-pointer hover:border-primary transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-muted-foreground text-base">Tirar foto ou anexar</span>
                <input type="file" accept="image/*" multiple className="hidden" />
              </label>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity">
              Enviar Relatório
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DriverMaintenance;
