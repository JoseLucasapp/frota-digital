import { useEffect, useMemo, useState } from "react";
import { Bell, X, FileText, Wrench, Fuel, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useMemo(() => getAuthUser(), []);
  const selectedNotif = notifications.find((n) => n.id === selected);

  useEffect(() => {
    if (!open) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = user?.role === 'ADMIN' ? { admin_id: user.id, limit: 20 } : { driver_id: user?.id, limit: 20 };
        const response = await api.get<{ data: any[] }>("/notifications", params);
        setNotifications(response.data || []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [open, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Bell className="w-5 h-5" /> Notificações</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Carregando...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {selectedNotif ? (
          <div className="space-y-4">
            <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline">← Voltar</button>
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = typeIcons[(selectedNotif.type || 'alert') as keyof typeof typeIcons] || AlertTriangle;
                return <Icon className={`w-6 h-6 ${typeColors[(selectedNotif.type || 'alert') as keyof typeof typeColors] || 'text-primary'}`} />;
              })()}
              <h3 className="text-lg font-semibold text-foreground">{selectedNotif.title}</h3>
            </div>
            <p className="text-foreground">{selectedNotif.message}</p>
            <p className="text-sm text-muted-foreground">{new Date(selectedNotif.created_at || selectedNotif.date).toLocaleString("pt-BR")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {!loading && notifications.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada.</p> : null}
            {notifications.map((n) => {
              const key = (n.type || 'alert') as keyof typeof typeIcons;
              const Icon = typeIcons[key] || AlertTriangle;
              return (
                <button key={n.id} onClick={() => setSelected(n.id)} className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-muted' : 'bg-primary'}`} />
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${typeColors[key] || 'text-primary'}`} />
                  <div className="min-w-0">
                    <p className={`font-medium text-sm ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
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