import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, FileText, Wrench, Fuel, AlertTriangle, Check, MapPin } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { isNotificationRead } from "@/lib/notifications";

const typeIcons = {
  document: FileText,
  maintenance: Wrench,
  fuel: Fuel,
  alert: AlertTriangle,
  tracking: MapPin,
};

const typeColors = {
  document: "text-warning",
  maintenance: "text-info",
  fuel: "text-destructive",
  alert: "text-primary",
  tracking: "text-primary",
};

type NotificationType = keyof typeof typeIcons;

type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  type?: NotificationType | string;
  created_at?: string;
  date?: string;
  read?: boolean | null;
  is_read?: boolean | null;
  vehicle_id?: string | null;
  vehicleId?: string | null;
  tracking_log_id?: string | null;
  trackingLogId?: string | null;
  fueling_id?: string | null;
  fuelingId?: string | null;
  maintenance_id?: string | null;
  maintenanceId?: string | null;
  entity_id?: string | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onNotificationsChange?: () => void;
}

const removeRawLinks = (value?: string | null) =>
  String(value || "")
    .split(/\n+/)
    .filter((line) => !/google maps\s*:/i.test(line) && !/https?:\/\//i.test(line))
    .join(" ")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const getNotificationTitle = (notification: NotificationItem) => {
  const title = String(notification.title || "Alerta").trim();
  const text = `${notification.type || ""} ${title} ${notification.message || ""}`.toLowerCase();

  if (text.includes("rastream") || text.includes("localiza")) return "Rastreamento atualizado";
  if (text.includes("parada")) return "Parada registrada";
  if (text.includes("abastec") || text.includes("combust")) return "Abastecimento registrado";

  return title;
};

const getNotificationDescription = (notification: NotificationItem) => {
  const cleaned = removeRawLinks(notification.message);
  if (!cleaned) return "Clique para abrir o módulo relacionado.";

  return cleaned.replace(/\.\s*Local:/i, " • Local:").trim();
};

const getNotificationKey = (notification: NotificationItem): NotificationType => {
  const text = `${notification.type || ""} ${notification.title || ""} ${notification.message || ""}`.toLowerCase();

  if (text.includes("rastream") || text.includes("localiza") || text.includes("parada")) return "tracking";
  if (text.includes("abastec") || text.includes("combust")) return "fuel";
  if (text.includes("manuten") || text.includes("mecân") || text.includes("mecan")) return "maintenance";
  if (text.includes("document")) return "document";

  return typeIcons[notification.type as NotificationType] ? notification.type as NotificationType : "alert";
};

const getNotificationRoute = (notification: NotificationItem) => {
  const key = getNotificationKey(notification);
  const message = String(notification.message || "");

  if (key === "tracking") {
    const params = new URLSearchParams();
    const vehicleId = notification.vehicle_id || notification.vehicleId;
    const trackingId = notification.tracking_log_id || notification.trackingLogId || notification.entity_id;
    const plateMatch = message.match(/de\s+([^\n.]+?)(?:\s+-|\.\s+Local:|\s+Local:)/i);

    if (vehicleId) params.set("vehicle_id", String(vehicleId));
    if (trackingId) params.set("tracking_id", String(trackingId));
    if (!vehicleId && plateMatch?.[1]) params.set("busca", plateMatch[1].trim());

    const query = params.toString();
    return `/admin/tracking${query ? `?${query}` : ""}`;
  }

  if (key === "fuel") {
    const id = notification.fueling_id || notification.fuelingId || notification.entity_id;
    return `/admin/fuel${id ? `?highlight=${encodeURIComponent(String(id))}` : ""}`;
  }

  if (key === "maintenance") {
    const id = notification.maintenance_id || notification.maintenanceId || notification.entity_id;
    return `/admin/maintenance${id ? `?highlight=${encodeURIComponent(String(id))}` : ""}`;
  }

  if (key === "document") return "/admin/drivers";

  return "/admin";
};

const NotificationModal = ({ open, onClose, onNotificationsChange }: Props) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const user = useMemo(() => getAuthUser(), []);

  useEffect(() => {
    if (!open) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<{ data: NotificationItem[] }>("/notifications", { limit: 20 });
        setNotifications(response.data || []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Erro ao carregar notificações");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [open, user?.id]);

  const markAsRead = async (notification: NotificationItem) => {
    if (isNotificationRead(notification)) return;

    setMarkingReadId(notification.id);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read: true, is_read: true } : item
      )
    );

    try {
      await api.put(`/notifications/${notification.id}`, { is_read: true });
      onNotificationsChange?.();
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: false, is_read: false } : item
        )
      );
      setError("Erro ao marcar notificação como lida");
    } finally {
      setMarkingReadId(null);
    }
  };

  const openNotificationTarget = async (notification: NotificationItem) => {
    await markAsRead(notification);
    onClose();
    navigate(getNotificationRoute(notification));
  };

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

        <div className="space-y-2">
          {!loading && notifications.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada.</p> : null}
          {notifications.map((notification) => {
            const key = getNotificationKey(notification);
            const Icon = typeIcons[key] || AlertTriangle;
            const read = isNotificationRead(notification);

            return (
              <div key={notification.id} className="flex w-full items-start gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50">
                <button onClick={() => openNotificationTarget(notification)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${read ? "bg-muted" : "bg-primary"}`} />
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${typeColors[key] || "text-primary"}`} />
                  <div className="min-w-0">
                    <p className={`font-medium text-sm ${read ? "text-muted-foreground" : "text-foreground"}`}>{getNotificationTitle(notification)}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{getNotificationDescription(notification)}</p>
                    <p className="mt-1 text-xs font-medium text-primary">Abrir detalhes</p>
                  </div>
                </button>
                {!read ? (
                  <button
                    onClick={() => markAsRead(notification)}
                    disabled={markingReadId === notification.id}
                    className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs font-medium text-primary hover:bg-secondary disabled:opacity-60"
                  >
                    {markingReadId === notification.id ? "..." : <><Check className="mr-1 inline h-3 w-3" />Lido</>}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
