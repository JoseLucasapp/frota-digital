import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Wrench, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";

const initialForm = {
  vehicle_id: "",
  mechanic_id: "",
  type: "",
  description: "",
  priority: "",
  estimated_cost: "",
  status: "PENDING",
};

const fieldLabels: Record<string, string> = {
  vehicle_id: "Veículo",
  mechanic_id: "Mecânico",
  type: "Tipo",
  description: "Descrição",
  priority: "Prioridade",
  estimated_cost: "Custo estimado",
  status: "Status",
};

const AdminMaintenance = () => {
  const [items, setItems] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(initialForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [maintenanceRes, vehicleRes, mechanicRes] = await Promise.all([
        api.get<{ data: any[] }>("/maintenances", { limit: 200 }),
        api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
        api.get<{ data: any[] }>("/mechanic", { limit: 200 }),
      ]);

      setItems(maintenanceRes.data || []);
      setVehicles(vehicleRes.data || []);
      setMechanics(mechanicRes.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar manutenções");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const vehiclesMap = useMemo(
    () => Object.fromEntries(vehicles.map((item) => [item.id, item])),
    [vehicles]
  );

  const mechanicsMap = useMemo(
    () => Object.fromEntries(mechanics.map((item) => [item.id, item])),
    [mechanics]
  );

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const term = search.toLowerCase();
        const vehicle = vehiclesMap[item.vehicle_id];
        const mechanic = mechanicsMap[item.mechanic_id];

        return (
          !term ||
          String(item.description || "").toLowerCase().includes(term) ||
          String(item.type || "").toLowerCase().includes(term) ||
          String(item.status || "").toLowerCase().includes(term) ||
          String(vehicle?.plate || "").toLowerCase().includes(term) ||
          String(vehicle?.model || "").toLowerCase().includes(term) ||
          String(mechanic?.name || "").toLowerCase().includes(term)
        );
      }),
    [items, search, vehiclesMap, mechanicsMap]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      vehicle_id: item.vehicle_id || "",
      mechanic_id: item.mechanic_id || "",
      type: item.type || "",
      description: item.description || "",
      priority: item.priority || "",
      estimated_cost: item.estimated_cost || "",
      status: item.status || "PENDING",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...form,
        mechanic_id: form.mechanic_id || null,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
      };

      if (editing) {
        await api.put(`/maintenances/${editing.id}`, payload);
      } else {
        await api.post("/maintenances", payload);
      }

      setForm(initialForm);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar manutenção");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/maintenances/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao excluir manutenção");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Manutenções</h1>
          <p className="text-muted-foreground text-lg">{items.length} registros</p>
        </div>

        <Button onClick={openCreate} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" />
          Nova manutenção
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por descrição, tipo, veículo ou mecânico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base bg-secondary border-border"
        />
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando manutenções...</div> : null}

      {!loading && (
        <div className="glass-card p-4 space-y-3">
          {filtered.map((item) => {
            const vehicle = vehiclesMap[item.vehicle_id];
            const mechanic = mechanicsMap[item.mechanic_id];

            return (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {item.type || "Manutenção"} — {item.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Veículo: {vehicle ? `${vehicle.plate} - ${vehicle.make || ""} ${vehicle.model || ""}` : item.vehicle_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mecânico: {mechanic ? mechanic.name : item.mechanic_id || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge>{item.status}</Badge>
                  <Button variant="outline" onClick={() => openEdit(item)}>
                    Editar
                  </Button>
                  <Button variant="destructive" onClick={() => remove(item.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}

          {!filtered.length ? <p className="text-sm text-muted-foreground">Nenhuma manutenção encontrada.</p> : null}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="glass-card w-full max-w-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {editing ? "Editar manutenção" : "Nova manutenção"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{fieldLabels.vehicle_id}</Label>
                <select
                  value={form.vehicle_id}
                  onChange={(e) => setForm((current: any) => ({ ...current, vehicle_id: e.target.value }))}
                  className="h-12 w-full rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {[vehicle.make, vehicle.model].filter(Boolean).join(" ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.mechanic_id}</Label>
                <select
                  value={form.mechanic_id}
                  onChange={(e) => setForm((current: any) => ({ ...current, mechanic_id: e.target.value }))}
                  className="h-12 w-full rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
                >
                  <option value="">Selecione um mecânico</option>
                  {mechanics.map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.name} {mechanic.cnpj ? `- ${mechanic.cnpj}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.type}</Label>
                <Input
                  value={String(form.type ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, type: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.priority}</Label>
                <Input
                  value={String(form.priority ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, priority: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{fieldLabels.description}</Label>
                <Input
                  value={String(form.description ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, description: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.estimated_cost}</Label>
                <Input
                  type="number"
                  value={String(form.estimated_cost ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, estimated_cost: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.status}</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((current: any) => ({ ...current, status: e.target.value }))}
                  className="h-12 w-full rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
                >
                  <option value="PENDING">Pendente</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="COMPLETED">Concluída</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
            </div>

            <Button
              disabled={saving}
              onClick={submit}
              className="w-full h-12 text-base gradient-primary text-primary-foreground"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminMaintenance;