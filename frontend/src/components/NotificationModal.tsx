import { useState } from "react";
import { Bell, X, FileText, Wrench, Fuel, AlertTriangle } from "lucide-react";
import { notifications } from "@/lib/mockData";

const typeIcons = {
  document: FileText,
  maintenance: Wrench,
  fuel: Fuel,
  alert: AlertTriangle,
};

const typeColors = {
  document: "text-warning",
  maintenance: "text-info",
  fuel: "text-destructive",
  alert: "text-primary",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationModal = ({ open, onClose }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNotif = notifications.find((n) => n.id === selected);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Bell className="w-5 h-5" /> Notificações</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {selectedNotif ? (
          <div className="space-y-4">
            <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline">← Voltar</button>
            <div className="flex items-center gap-3">
              {(() => { const Icon = typeIcons[selectedNotif.type]; return <Icon className={`w-6 h-6 ${typeColors[selectedNotif.type]}`} />; })()}
              <h3 className="text-lg font-semibold text-foreground">{selectedNotif.title}</h3>
            </div>
            <p className="text-foreground">{selectedNotif.message}</p>
            <p className="text-sm text-muted-foreground">{new Date(selectedNotif.date).toLocaleDateString("pt-BR")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = typeIcons[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => setSelected(n.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? "bg-primary" : "bg-muted"}`} />
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${typeColors[n.type]}`} />
                  <div className="min-w-0">
                    <p className={`font-medium text-sm ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{n.message}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
