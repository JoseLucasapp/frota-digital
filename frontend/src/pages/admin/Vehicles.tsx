import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Car, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api";

const initialForm = {
  plate: "",
  make: "",
  model: "",
  year: "",
  fuel_type: "",
  current_km: "",
  status: "active",
  driver_id: "none",
};

const fieldLabels: Record<string, string> = {
  plate: "Placa",
  make: "Marca",
  model: "Modelo",
  year: "Ano",
  fuel_type: "Combustível",
  current_km: "Quilometragem atual",
  status: "Status",
  driver_id: "Motorista",
};

const vehicleStatusOptions = [
  { value: "active", label: "Ativo" },
  { value: "maintenance", label: "Em manutenção" },
  { value: "inactive", label: "Inativo" },
];

const getStatusLabel = (status?: string) =>
  vehicleStatusOptions.find((item) => item.value === status)?.label || status || "—";

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(initialForm);
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const [vehicleResponse, driverResponse, loanResponse] = await Promise.all([
        api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
        api.get<{ data: any[] }>("/driver", { limit: 200 }),
        api.get<{ data: any[] }>("/loans", { limit: 500 }),
      ]);

      setVehicles(vehicleResponse.data || []);
      setDrivers(driverResponse.data || []);
      setLoans(loanResponse.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const latestLoanByVehicleId = useMemo(() => {
    const map = new Map<string, any>();

    [...loans]
      .sort(
        (a, b) =>
          new Date(b.start_date || b.created_at || 0).getTime() -
          new Date(a.start_date || a.created_at || 0).getTime()
      )
      .forEach((loan) => {
        if (!map.has(loan.vehicle_id)) {
          map.set(loan.vehicle_id, loan);
        }
      });

    return map;
  }, [loans]);

  const driverById = useMemo(() => {
    const map = new Map<string, any>();
    drivers.forEach((driver) => {
      map.set(driver.id, driver);
    });
    return map;
  }, [drivers]);

  const filtered = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const term = search.toLowerCase();
        const currentLoan = latestLoanByVehicleId.get(vehicle.id);
        const currentDriver = currentLoan?.driver_id
          ? driverById.get(currentLoan.driver_id)
          : null;

        return (
          !term ||
          String(vehicle.plate || "").toLowerCase().includes(term) ||
          String(vehicle.model || "").toLowerCase().includes(term) ||
          String(vehicle.make || "").toLowerCase().includes(term) ||
          String(currentDriver?.name || "").toLowerCase().includes(term)
        );
      }),
    [vehicles, search, latestLoanByVehicleId, driverById]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (vehicle: any) => {
    const currentLoan = latestLoanByVehicleId.get(vehicle.id);
    setEditing(vehicle);
    setForm({
      plate: vehicle.plate || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      fuel_type: vehicle.fuel_type || "",
      current_km: vehicle.current_km || "",
      status: vehicle.status || "active",
      driver_id: currentLoan?.driver_id || "none",
    });
    setModalOpen(true);
  };

  const syncVehicleDriver = async (vehicleId: string, selectedDriverId: string) => {
    const currentLoan = latestLoanByVehicleId.get(vehicleId);
    const currentDriverId = currentLoan?.driver_id || "none";

    if (selectedDriverId === currentDriverId) {
      return;
    }

    if (currentLoan?.id && selectedDriverId === "none") {
      await api.put(`/loans/${currentLoan.id}`, {
        end_date: new Date().toISOString(),
      });
      return;
    }

    if (currentLoan?.id && currentLoan.driver_id && selectedDriverId !== currentLoan.driver_id) {
      await api.put(`/loans/${currentLoan.id}`, {
        end_date: new Date().toISOString(),
      });
    }

    if (selectedDriverId !== "none") {
      await api.post("/loans", {
        vehicle_id: vehicleId,
        driver_id: selectedDriverId,
        start_date: new Date().toISOString(),
      });
    }
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        plate: form.plate,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        fuel_type: form.fuel_type,
        current_km: Number(form.current_km),
        status: form.status,
      };

      let vehicleId = editing?.id;

      if (editing) {
        await api.put(`/vehicle/${editing.id}`, payload);
      } else {
        const created = await api.post<any>("/vehicle", payload);
        vehicleId = created?.data?.id || created?.id;
      }

      if (vehicleId) {
        await syncVehicleDriver(vehicleId, form.driver_id);
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditing(null);
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

  const updateVehicleStatus = async (vehicle: any, status: string) => {
    try {
      setUpdatingStatusId(vehicle.id);
      setError(null);

      await api.put(`/vehicle/${vehicle.id}`, {
        plate: vehicle.plate,
        make: vehicle.make,
        model: vehicle.model,
        year: Number(vehicle.year),
        fuel_type: vehicle.fuel_type,
        current_km: Number(vehicle.current_km),
        status,
      });

      setVehicles((current) =>
        current.map((item) => (item.id === vehicle.id ? { ...item, status } : item))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground text-lg">{vehicles.length} veículos cadastrados</p>
        </div>
        <Button
          onClick={openCreate}
          className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo veículo
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por placa, marca, modelo ou motorista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base bg-secondary border-border"
        />
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {loading ? (
        <div className="glass-card p-4 text-sm text-muted-foreground">Carregando veículos...</div>
      ) : null}

      {!loading && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Veículo</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Placa</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Motorista</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">KM</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Combustível</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => {
                const currentLoan = latestLoanByVehicleId.get(vehicle.id);
                const currentDriver = currentLoan?.driver_id
                  ? driverById.get(currentLoan.driver_id)
                  : null;

                return (
                  <tr
                    key={vehicle.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
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
                    <td className="p-4">
                      {currentDriver ? (
                        <div>
                          <p className="font-medium text-foreground">{currentDriver.name}</p>
                          <p className="text-sm text-muted-foreground">{currentDriver.phone || "—"}</p>
                        </div>
                      ) : (
                        <Badge variant="secondary">Sem motorista</Badge>
                      )}
                    </td>
                    <td className="p-4 text-foreground">
                      {Number(vehicle.current_km || 0).toLocaleString("pt-BR")} km
                    </td>
                    <td className="p-4 text-foreground">{vehicle.fuel_type || "—"}</td>
                    <td className="p-4 min-w-[180px]">
                      <Select
                        value={vehicle.status || "active"}
                        onValueChange={(value) => updateVehicleStatus(vehicle, value)}
                        disabled={updatingStatusId === vehicle.id}
                      >
                        <SelectTrigger className="h-10 bg-secondary border-border">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleStatusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                );
              })}
            </tbody>
          </table>

          {!filtered.length ? (
            <div className="p-4 text-sm text-muted-foreground">Nenhum veículo encontrado.</div>
          ) : null}
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
                {editing ? "Editar veículo" : "Novo veículo"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {["plate", "make", "model", "year", "fuel_type", "current_km"].map((key) => (
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

              <div className="space-y-2">
                <Label>{fieldLabels.status}</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current: any) => ({ ...current, status: value }))
                  }
                >
                  <SelectTrigger className="h-12 bg-secondary border-border">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.driver_id}</Label>
                <Select
                  value={form.driver_id}
                  onValueChange={(value) =>
                    setForm((current: any) => ({ ...current, driver_id: value }))
                  }
                >
                  <SelectTrigger className="h-12 bg-secondary border-border">
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem motorista</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default AdminVehicles;