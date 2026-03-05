import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock3,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DocumentStatus =
  | "approved"
  | "pending_review"
  | "missing"
  | "expired"
  | "rejected";

interface DriverDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  expiry: string | null;
  uploaded: boolean;
  fileName: string | null;
  uploadedAt: string | null;
  note?: string;
}

const documents: DriverDocument[] = [
  {
    id: "1",
    name: "CNH",
    status: "expired",
    expiry: "15/06/2025",
    uploaded: true,
    fileName: "cnh_jose_lucas_frente.pdf",
    uploadedAt: "12/05/2025 às 14:32",
    note: "Documento vencido. Envie uma CNH atualizada.",
  },
  {
    id: "2",
    name: "RG",
    status: "approved",
    expiry: null,
    uploaded: true,
    fileName: "rg_jose_lucas.jpg",
    uploadedAt: "10/02/2026 às 09:14",
    note: "Documento aprovado pela administração.",
  },
  {
    id: "3",
    name: "CPF",
    status: "pending_review",
    expiry: null,
    uploaded: true,
    fileName: "cpf_jose_lucas.pdf",
    uploadedAt: "04/03/2026 às 18:41",
    note: "Documento enviado e aguardando validação do administrador.",
  },
  {
    id: "4",
    name: "Comprovante de Residência",
    status: "missing",
    expiry: null,
    uploaded: false,
    fileName: null,
    uploadedAt: null,
    note: "Envie um comprovante recente dos últimos 90 dias.",
  },
  {
    id: "5",
    name: "Foto do Perfil / Crachá",
    status: "rejected",
    expiry: null,
    uploaded: true,
    fileName: "foto_perfil_borrada.png",
    uploadedAt: "01/03/2026 às 11:20",
    note: "Arquivo recusado: imagem borrada. Envie uma foto mais nítida.",
  },
];

const statusConfig: Record<
  DocumentStatus,
  {
    label: string;
    className: string;
    icon: JSX.Element;
  }
> = {
  approved: {
    label: "Aprovado",
    className: "bg-success/20 text-success border-0 gap-1",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  pending_review: {
    label: "Em análise",
    className: "bg-info/20 text-info border-0 gap-1",
    icon: <Clock3 className="w-3 h-3" />,
  },
  missing: {
    label: "Pendente",
    className: "bg-warning/20 text-warning border-0 gap-1",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  expired: {
    label: "Vencido",
    className: "bg-destructive/20 text-destructive border-0 gap-1",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  rejected: {
    label: "Recusado",
    className: "bg-destructive/20 text-destructive border-0 gap-1",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const DriverDocuments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary p-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/driver")}
          className="text-primary-foreground"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-primary-foreground">
            Meus Documentos
          </h1>
          <p className="text-sm text-primary-foreground/80">
            Acompanhe envio, validade e aprovação dos seus documentos
          </p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 max-w-lg mx-auto space-y-4"
      >
        {documents.map((doc) => {
          const status = statusConfig[doc.status];
          const actionLabel =
            doc.status === "missing" ? "Enviar documento" : "Atualizar documento";

          return (
            <div key={doc.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-info" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-lg leading-tight">
                      {doc.name}
                    </p>

                    {doc.expiry && (
                      <p className="text-sm text-muted-foreground">
                        Validade: {doc.expiry}
                      </p>
                    )}

                    {doc.fileName && (
                      <p className="text-sm text-muted-foreground truncate">
                        Arquivo: {doc.fileName}
                      </p>
                    )}

                    {doc.uploadedAt && (
                      <p className="text-xs text-muted-foreground">
                        Último envio: {doc.uploadedAt}
                      </p>
                    )}
                  </div>
                </div>

                <Badge className={status.className}>
                  {status.icon}
                  {status.label}
                </Badge>
              </div>

              {doc.note && (
                <div className="mb-4 rounded-xl bg-secondary/40 border border-border p-3">
                  <p className="text-sm text-muted-foreground">{doc.note}</p>
                </div>
              )}

              <label className="flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">{actionLabel}</span>
                <input type="file" accept="image/*,.pdf" className="hidden" />
              </label>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default DriverDocuments;
