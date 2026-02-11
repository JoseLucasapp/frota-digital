import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Field {
  label: string;
  placeholder: string;
  type?: string;
  colSpan?: boolean;
}

interface CreateModalProps {
  title: string;
  fields: Field[];
  onClose: () => void;
  successMessage: string;
}

const CreateModal = ({ title, fields, onClose, successMessage }: CreateModalProps) => {
  const handleSave = () => {
    toast({ title: successMessage, description: "Registro salvo com sucesso." });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label} className={`space-y-2 ${f.colSpan ? "sm:col-span-2" : ""}`}>
              <Label className="text-base">{f.label}</Label>
              <Input type={f.type || "text"} className="h-12 text-base bg-secondary border-border" placeholder={f.placeholder} />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} className="w-full h-12 text-base gradient-primary text-primary-foreground">Salvar</Button>
      </div>
    </div>
  );
};

export default CreateModal;
