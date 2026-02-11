import { motion } from "framer-motion";
import { User, Mail, Phone, Building2, Shield, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const AdminProfile = () => {
  const handleSave = () => {
    toast({ title: "Perfil atualizado!", description: "As alterações foram salvas." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground text-lg">Gerencie suas informações</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            AD
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Administrador</h2>
            <p className="text-muted-foreground flex items-center gap-1"><Shield className="w-4 h-4" /> Admin Institucional</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Nome do Responsável</Label>
              <Input defaultValue="João da Silva" className="h-12 text-base bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" /> Função do Responsável</Label>
              <Input defaultValue="Secretário de Transportes" className="h-12 text-base bg-secondary border-border" placeholder="Ex: Secretário, Diretor, Coordenador" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
              <Input defaultValue="admin@prefeitura.gov.br" className="h-12 text-base bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</Label>
              <Input defaultValue="(11) 3456-7890" className="h-12 text-base bg-secondary border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> Instituição</Label>
            <Input defaultValue="Prefeitura Municipal" className="h-12 text-base bg-secondary border-border" />
          </div>
          <Button onClick={handleSave} className="h-12 px-8 text-base gradient-primary hover:opacity-90 transition-opacity">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;
