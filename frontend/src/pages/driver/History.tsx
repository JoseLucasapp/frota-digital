import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3, ExternalLink, Fuel, MapPin, SquareParking, Wrench } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { buildGoogleMapsUrl } from "@/lib/maps";
import { cleanTrackingNotes, isStopTrackingLog, trackingSourceLabel } from "@/lib/tracking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TrackingLog = {
  id: string;
  vehicle_id: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  source?: string | null;
  notes?: string | null;
  recorded_at?: string | null;
  is_stop?: boolean | null;
  google_maps_url?: string | null;
};

type HistoryCategory = "all" | "tracking" | "maintenance" | "fueling";

type HistoryItem = {
  id: string;
  category: Exclude<HistoryCategory, "all">;
  type: string;
  description: string;
  date?: string | null;
  icon: typeof Clock3;
  extra?: string;
  mapUrl?: string | null;
};

const historyTabs: Array<{ value: HistoryCategory; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "tracking", label: "Rastreio" },
  { value: "maintenance", label: "Manutenção" },
  { value: "fueling", label: "Abastec." },
];

const DriverHistory = () => {
  const user = getAuthUser();
  const navigate = useNavigate();
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ data: any[] }>("/fueling", { limit: 200 }),
      api.get<{ data: any[] }>("/maintenances", { limit: 200 }),
      api.get<{ data: TrackingLog[] }>("/tracking/logs", { limit: 200 }),
    ])
      .then(([fuelingRes, maintenanceRes, trackingRes]) => {
        setFuelings(fuelingRes.data || []);
        setMaintenances(maintenanceRes.data || []);
        setTrackingLogs(trackingRes.data || []);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Erro ao carregar histórico"));
  }, []);

  const history = useMemo<HistoryItem[]>(
    () => [
      ...fuelings.map((item) => ({
        id: `f-${item.id}`,
        category: "fueling" as const,
        type: "Abastecimento",
        description: `${item.fuel_type} em ${item.station}`,
        date: item.created_at || item.date,
        icon: Fuel,
        extra: undefined,
        mapUrl: undefined,
      })),
      ...maintenances.map((item) => ({
        id: `m-${item.id}`,
        category: "maintenance" as const,
        type: "Manutenção",
        description: item.description,
        date: item.created_at || item.updated_at,
        icon: Wrench,
        extra: undefined,
        mapUrl: undefined,
      })),
      ...trackingLogs.map((item) => {
        const isStop = isStopTrackingLog(item);
        const notes = cleanTrackingNotes(item.notes);

        return {
          id: `t-${item.id}`,
          category: "tracking" as const,
          type: isStop ? "Parada" : "Rastreamento",
          description:
            item.address ||
            (item.latitude != null && item.longitude != null
              ? `${item.latitude}, ${item.longitude}`
              : "Localização sem endereço"),
          date: item.recorded_at,
          icon: isStop ? SquareParking : MapPin,
          extra: notes || `Origem: ${trackingSourceLabel(item.source)}`,
          mapUrl: item.google_maps_url || buildGoogleMapsUrl(item),
        };
      }),
    ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()),
    [fuelings, maintenances, trackingLogs],
  );

  const historyByCategory = useMemo(
    () => ({
      all: history,
      tracking: history.filter((item) => item.category === "tracking"),
      maintenance: history.filter((item) => item.category === "maintenance"),
      fueling: history.filter((item) => item.category === "fueling"),
    }),
    [history],
  );

  const renderHistoryList = (items: HistoryItem[], emptyMessage: string) => (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
            <Icon className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.type}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.extra ? <p className="text-xs text-muted-foreground mt-1">{item.extra}</p> : null}
              {item.mapUrl ? (
                <a
                  href={item.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google Maps
                </a>
              ) : null}
              <p className="text-xs text-muted-foreground mt-1">
                {item.date ? new Date(item.date).toLocaleString("pt-BR") : "Sem data"}
              </p>
            </div>
          </div>
        );
      })}
      {!items.length ? <p className="text-sm text-muted-foreground">{emptyMessage}</p> : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate("/driver")} className="text-primary-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Meu Histórico</h1>
        </div>
      </div>
      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      <Tabs defaultValue="all" className="glass-card p-4 md:p-6">
        <TabsList className="grid h-auto w-full grid-cols-4 bg-secondary">
          {historyTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-w-0 gap-1 overflow-hidden px-2 text-xs sm:text-sm"
            >
              <span className="min-w-0 truncate">{tab.label}</span>
              <span className="shrink-0 text-[10px] opacity-70 sm:text-xs">{historyByCategory[tab.value].length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderHistoryList(historyByCategory.all, "Nenhum histórico encontrado.")}
        </TabsContent>
        <TabsContent value="tracking" className="mt-4">
          {renderHistoryList(historyByCategory.tracking, "Nenhum rastreio encontrado.")}
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          {renderHistoryList(historyByCategory.maintenance, "Nenhuma manutenção encontrada.")}
        </TabsContent>
        <TabsContent value="fueling" className="mt-4">
          {renderHistoryList(historyByCategory.fueling, "Nenhum abastecimento encontrado.")}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverHistory;
