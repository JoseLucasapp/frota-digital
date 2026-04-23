import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Fuel, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { FUEL_TYPE_OPTIONS } from "@/lib/vehicleCatalog";

const initialForm = {
  vehicle_id: "",
  fuel_type: "",
  liters: "",
  price_per_liter: "",
  current_km: "",
  station: "",
};

const fieldLabels: Record<string, string> = {
  vehicle_id: "Veículo",
  fuel_type: "Combustível",
  liters: "Litros",
  price_per_liter: "Preço por litro",
  current_km: "Quilometragem atual",
  station: "Posto",
};

const AdminFuel = () => {
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
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

      const [fuelingRes, vehicleRes] = await Promise.all([
        api.get<{ data: any[] }>("/fueling", { limit: 200 }),
        api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
      ]);

      setFuelings(fuelingRes.data || []);
      setVehicles(vehicleRes.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar abastecimentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);


  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles]
  );

  useEffect(() => {
    if (!form.vehicle_id) return;
    const selectedVehicle = vehicleById[form.vehicle_id];
    if (!selectedVehicle) return;

    setForm((current: typeof initialForm) => ({
      ...current,
      fuel_type: selectedVehicle.fuel_type || current.fuel_type,
      current_km:
        selectedVehicle.current_km != null && selectedVehicle.current_km !== ""
          ? String(selectedVehicle.current_km)
          : current.current_km,
    }));
  }, [form.vehicle_id, vehicleById]);

  const filtered = useMemo(
    () =>
      fuelings.filter((fueling) => {
        const plate = vehicleById[fueling.vehicle_id]?.plate || "";
        const model = vehicleById[fueling.vehicle_id]?.model || "";
        const term = search.toLowerCase();

        return (
          !term ||
          String(fueling.station || "").toLowerCase().includes(term) ||
          String(fueling.fuel_type || "").toLowerCase().includes(term) ||
          String(plate).toLowerCase().includes(term) ||
          String(model).toLowerCase().includes(term)
        );
      }),
    [fuelings, search, vehicleById]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (fueling: any) => {
    setEditing(fueling);
    setForm({
      vehicle_id: fueling.vehicle_id || "",
      fuel_type: fueling.fuel_type || "",
      liters: fueling.liters || "",
      price_per_liter: fueling.price_per_liter || "",
      current_km: fueling.current_km || "",
      station: fueling.station || "",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...form,
        liters: Number(form.liters),
        price_per_liter: Number(form.price_per_liter),
        current_km: Number(form.current_km),
      };

      if (editing) {
        await api.put(`/fueling/${editing.id}`, payload);
      } else {
        await api.post("/fueling", payload);
      }

      setForm(initialForm);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar abastecimento");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/fueling/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao excluir abastecimento");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Abastecimentos</h1>
          <p className="text-muted-foreground text-lg">{fuelings.length} registros</p>
        </div>

        <Button onClick={openCreate} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" />
          Novo abastecimento
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por posto, placa ou combustível..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base bg-secondary border-border"
        />
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando abastecimentos...</div> : null}

      {!loading && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Veículo</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Combustível</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Litros</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Preço</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Posto</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((fueling) => {
                const vehicle = vehicleById[fueling.vehicle_id];
                const total = Number(
                  fueling.total_price ||
                  Number(fueling.liters || 0) * Number(fueling.price_per_liter || 0)
                );

                return (
                  <tr key={fueling.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <Fuel className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {vehicle?.plate || fueling.vehicle_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            KM {Number(fueling.current_km || 0).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-foreground">{fueling.fuel_type}</td>
                    <td className="p-4 text-foreground">{fueling.liters}</td>
                    <td className="p-4 text-foreground">
                      R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-foreground">{fueling.station}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="outline" onClick={() => openEdit(fueling)}>
                        Editar
                      </Button>
                      <Button variant="destructive" onClick={() => remove(fueling.id)}>
                        Excluir
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filtered.length ? <div className="p-4 text-sm text-muted-foreground">Nenhum abastecimento encontrado.</div> : null}
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
                {editing ? "Editar abastecimento" : "Novo abastecimento"}
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
                <Label>{fieldLabels.fuel_type}</Label>
                <select
                  value={String(form.fuel_type ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, fuel_type: e.target.value }))}
                  className="h-12 w-full rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
                >
                  <option value="">Selecione o combustível</option>
                  {FUEL_TYPE_OPTIONS.map((fuelType) => (
                    <option key={fuelType} value={fuelType}>
                      {fuelType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.liters}</Label>
                <Input
                  type="number"
                  value={String(form.liters ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, liters: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.price_per_liter}</Label>
                <Input
                  type="number"
                  value={String(form.price_per_liter ?? "")}
                  onChange={(e) =>
                    setForm((current: any) => ({ ...current, price_per_liter: e.target.value }))
                  }
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.current_km}</Label>
                <Input
                  type="number"
                  value={String(form.current_km ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, current_km: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.station}</Label>
                <Input
                  value={String(form.station ?? "")}
                  onChange={(e) => setForm((current: any) => ({ ...current, station: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                />
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

export default AdminFuel;