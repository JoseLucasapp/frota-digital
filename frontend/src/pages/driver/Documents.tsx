import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const documents = [
  { name: "CNH", status: "valid", expiry: "15/06/2025", uploaded: true },
  { name: "RG", status: "valid", expiry: null, uploaded: true },
  { name: "CPF", status: "valid", expiry: null, uploaded: true },
  { name: "Comprovante de Residência", status: "pending", expiry: null, uploaded: false },
];

const DriverDocuments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-4 flex items-center gap-3">
        <button onClick={() => navigate("/driver")} className="text-primary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary-foreground">Meus Documentos</h1>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 max-w-lg mx-auto space-y-4">
        {documents.map((doc) => (
          <div key={doc.name} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">{doc.name}</p>
                  {doc.expiry && <p className="text-sm text-muted-foreground">Validade: {doc.expiry}</p>}
                </div>
              </div>
              {doc.uploaded ? (
                <Badge className="bg-success/20 text-success border-0 gap-1">
                  <CheckCircle className="w-3 h-3" /> Enviado
                </Badge>
              ) : (
                <Badge className="bg-warning/20 text-warning border-0 gap-1">
                  <AlertTriangle className="w-3 h-3" /> Pendente
                </Badge>
              )}
            </div>
            <label className="flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">{doc.uploaded ? "Atualizar documento" : "Enviar documento"}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" />
            </label>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default DriverDocuments;
