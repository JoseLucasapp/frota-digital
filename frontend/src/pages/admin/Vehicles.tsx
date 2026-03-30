import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Car, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

const initialForm = {
  plate: "",
  make: "",
  model: "",
  year: "",
  fuel_type: "",
  current_km: "",
  status: "active",
};

const fieldLabels: Record<string, string> = {
  plate: "Placa",
  make: "Marca",
  model: "Modelo",
  year: "Ano",
  fuel_type: "Combustível",
  current_km: "Quilometragem atual",
  status: "Status",
};

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(initialForm);
  const [saving, setSaving] = useState(false);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: any[] }>("/vehicle", { limit: 200 });
      setVehicles(response.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const filtered = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const term = search.toLowerCase();
        return (
          !term ||
          String(vehicle.plate || "").toLowerCase().includes(term) ||
          String(vehicle.model || "").toLowerCase().includes(term) ||
          String(vehicle.make || "").toLowerCase().includes(term)
        );
      }),
    [vehicles, search]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (vehicle: any) => {
    setEditing(vehicle);
    setForm({
      plate: vehicle.plate || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      fuel_type: vehicle.fuel_type || "",
      current_km: vehicle.current_km || "",
      status: vehicle.status || "active",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...form,
        year: Number(form.year),
        current_km: Number(form.current_km),
      };

      if (editing) {
        await api.put(`/vehicle/${editing.id}`, payload);
      } else {
        await api.post("/vehicle", payload);
      }

      setModalOpen(false);
      await loadVehicles();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar veículo");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/vehicle/${id}`);
      await loadVehicles();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao excluir veículo");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground text-lg">{vehicles.length} veículos cadastrados</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2">
          <Plus className="w-5 h-5" />
          Novo veículo
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por placa, marca ou modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base bg-secondary border-border"
        />
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando veículos...</div> : null}

      {!loading && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Veículo</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Placa</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">KM</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Combustível</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-foreground">{vehicle.plate}</td>
                  <td className="p-4 text-foreground">
                    {Number(vehicle.current_km || 0).toLocaleString("pt-BR")} km
                  </td>
                  <td className="p-4 text-foreground">{vehicle.fuel_type || "—"}</td>
                  <td className="p-4">
                    <Badge>{vehicle.status || "—"}</Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="outline" onClick={() => openEdit(vehicle)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => remove(vehicle.id)}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filtered.length ? <div className="p-4 text-sm text-muted-foreground">Nenhum veículo encontrado.</div> : null}
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
              <h2 className="text-xl font-bold text-foreground">{editing ? "Editar veículo" : "Novo veículo"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {["plate", "make", "model", "year", "fuel_type", "current_km", "status"].map((key) => (
                <div key={key} className="space-y-2">
                  <Label>{fieldLabels[key] || key}</Label>
                  <Input
                    value={String(form[key] ?? "")}
                    onChange={(e) =>
                      setForm((current: any) => ({ ...current, [key]: e.target.value }))
                    }
                    className="h-12 bg-secondary border-border"
                  />
                </div>
              ))}
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

export default AdminVehicles;