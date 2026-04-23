import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock3, MapPin, Navigation, Search } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const OFFLINE_LIMIT_MS = 2 * 60 * 60 * 1000;

type TrackingOverviewItem = {
  id: string;
  plate: string;
  make?: string | null;
  model?: string | null;
  status?: string | null;
  last_latitude?: number | null;
  last_longitude?: number | null;
  last_address?: string | null;
  last_tracked_at?: string | null;
  last_tracking_source?: string | null;
  tracking_status: "ok" | "offline";
  driver?: {
    id: string;
    name?: string | null;
    phone?: string | null;
  } | null;
};

type TrackingLog = {
  id: string;
  vehicle_id: string;
  driver_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  source?: string | null;
  notes?: string | null;
  recorded_at?: string | null;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Sem atualização";
  return new Date(value).toLocaleString("pt-BR");
};

const getTrackingStatus = (trackedAt?: string | null) => {
  if (!trackedAt) return "offline";
  return Date.now() - new Date(trackedAt).getTime() <= OFFLINE_LIMIT_MS ? "ok" : "offline";
};

const AdminTracking = () => {
  const [vehicles, setVehicles] = useState<TrackingOverviewItem[]>([]);
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overviewRes, logsRes] = await Promise.all([
          api.get<{ data: TrackingOverviewItem[] }>("/tracking/overview", { limit: 200 }),
          api.get<{ data: TrackingLog[] }>("/tracking/logs", { limit: 200 }),
        ]);

        const overview = (overviewRes.data || []).map((item) => ({
          ...item,
          tracking_status: getTrackingStatus(item.last_tracked_at) as "ok" | "offline",
        }));

        setVehicles(overview);
        setLogs(logsRes.data || []);
        setSelectedVehicleId((current) => current || overview[0]?.id || null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Erro ao carregar rastreio");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return vehicles;

    return vehicles.filter((vehicle) => {
      const haystack = [
        vehicle.plate,
        vehicle.make,
        vehicle.model,
        vehicle.driver?.name,
        vehicle.last_address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [search, vehicles]);

  useEffect(() => {
    if (!filteredVehicles.length) {
      setSelectedVehicleId(null);
      return;
    }

    const exists = filteredVehicles.some((item) => item.id === selectedVehicleId);
    if (!exists) {
      setSelectedVehicleId(filteredVehicles[0].id);
    }
  }, [filteredVehicles, selectedVehicleId]);

  const selectedVehicle = filteredVehicles.find((item) => item.id === selectedVehicleId) || null;

  const selectedLogs = useMemo(
    () => logs.filter((item) => item.vehicle_id === selectedVehicleId),
    [logs, selectedVehicleId],
  );

  const summary = useMemo(() => {
    const total = vehicles.length;
    const online = vehicles.filter((item) => item.tracking_status === "ok").length;
    const offline = Math.max(total - online, 0);
    const withAddress = vehicles.filter((item) => item.last_address).length;

    return { total, online, offline, withAddress };
  }, [vehicles]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Rastreamento</h1>
          <p className="text-muted-foreground text-lg">Histórico e última posição dos veículos</p>
        </div>

        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por placa, veículo, motorista..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Veículos</p>
          <p className="text-3xl font-bold text-foreground mt-2">{summary.total}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Atualizados em até 2h</p>
          <p className="text-3xl font-bold text-success mt-2">{summary.online}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Offline</p>
          <p className="text-3xl font-bold text-destructive mt-2">{summary.offline}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Com endereço salvo</p>
          <p className="text-3xl font-bold text-foreground mt-2">{summary.withAddress}</p>
        </div>
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando rastreio...</div> : null}
          {!loading && !filteredVehicles.length ? (
            <div className="glass-card p-4 text-sm text-muted-foreground">Nenhum veículo encontrado.</div>
          ) : null}

          {filteredVehicles.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;
            return (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`w-full glass-card p-4 text-left transition-all hover:border-primary/50 ${
                  isSelected ? "border-primary ring-1 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Veículo"}
                    </p>
                    <p className="font-mono text-primary text-sm mt-1">{vehicle.plate}</p>
                  </div>
                  <Badge className={vehicle.tracking_status === "ok" ? "bg-success/20 text-success border-0" : "bg-destructive/20 text-destructive border-0"}>
                    {vehicle.tracking_status === "ok" ? "Atualizado" : "Offline"}
                  </Badge>
                </div>

                <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    <span>{vehicle.driver?.name || "Sem motorista vinculado"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4" />
                    <span>{formatDateTime(vehicle.last_tracked_at)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span className="line-clamp-2">{vehicle.last_address || "Sem endereço informado"}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedVehicle ? (
            <>
              <div className="glass-card p-6 space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {[selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(" ") || "Veículo"}
                    </h3>
                    <p className="font-mono text-primary text-lg mt-1">{selectedVehicle.plate}</p>
                  </div>
                  <Badge className={selectedVehicle.tracking_status === "ok" ? "bg-success/20 text-success border-0" : "bg-destructive/20 text-destructive border-0"}>
                    {selectedVehicle.tracking_status === "ok" ? "Atualizado em até 2h" : "Sem atualização recente"}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">Motorista</p>
                    <p className="font-medium text-foreground mt-1">{selectedVehicle.driver?.name || "Sem motorista vinculado"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedVehicle.driver?.phone || "Sem telefone"}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">Última atualização</p>
                    <p className="font-medium text-foreground mt-1">{formatDateTime(selectedVehicle.last_tracked_at)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Origem: {selectedVehicle.last_tracking_source || "Não informada"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium text-foreground mt-1">{selectedVehicle.last_address || "Sem endereço informado"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedVehicle.last_latitude != null && selectedVehicle.last_longitude != null
                        ? `${selectedVehicle.last_latitude}, ${selectedVehicle.last_longitude}`
                        : "Sem latitude/longitude"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Histórico de atualizações</h3>
                </div>

                <div className="space-y-3">
                  {selectedLogs.map((log) => (
                    <div key={log.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-medium text-foreground">{log.address || "Sem endereço informado"}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.latitude != null && log.longitude != null
                              ? `${log.latitude}, ${log.longitude}`
                              : "Sem latitude/longitude"}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{formatDateTime(log.recorded_at)}</p>
                          <p className="mt-1">Origem: {log.source || "manual"}</p>
                        </div>
                      </div>
                      {log.notes ? <p className="text-sm text-muted-foreground mt-3">Obs.: {log.notes}</p> : null}
                    </div>
                  ))}

                  {!selectedLogs.length ? (
                    <p className="text-sm text-muted-foreground">Nenhuma atualização de rastreio para este veículo.</p>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-6 text-sm text-muted-foreground">
              Selecione um veículo para ver os detalhes de rastreio.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminTracking;
