import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Car, X } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { getAvailableMakes, getAvailableModels, getAvailableYears, getCatalogFuelType } from "@/lib/vehicleCatalog";

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

const vehicleStatusOptions = [
  { value: "active", label: "Ativo" },
  { value: "maintenance", label: "Em manutenção" },
  { value: "inactive", label: "Inativo" },
];

const normalizeText = (value?: string) => String(value || "").trim().toLowerCase();

const getStatusLabel = (status?: string) =>
  vehicleStatusOptions.find((item) => item.value === status)?.label || status || "—";

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(initialForm);
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingDriverId, setUpdatingDriverId] = useState<string | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const [vehicleResponse, driverResponse, loanResponse] = await Promise.all([
        api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
        api.get<{ data: any[] }>("/driver", { limit: 200 }),
        api.get<{ data: any[] }>("/loans", { limit: 500 }),
      ]);

      setVehicles(vehicleResponse.data || []);
      setDrivers(driverResponse.data || []);
      setLoans(loanResponse.data || []);
    } catch (err) {
      toast({
        title: "Erro ao carregar veículos",
        description: err instanceof ApiError ? err.message : "Não foi possível carregar a lista de veículos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const activeLoanByVehicleId = useMemo(() => {
    const map = new Map<string, any>();

    loans
      .filter((loan) => !loan.end_date)
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


  const availableMakes = useMemo(
    () => getAvailableMakes(vehicles.map((vehicle) => String(vehicle.make || ""))),
    [vehicles]
  );

  const availableYears = useMemo(
    () => getAvailableYears(form.make, vehicles.filter((vehicle) => normalizeText(vehicle.make) === normalizeText(form.make)).map((vehicle) => vehicle.year)),
    [form.make, vehicles]
  );

  const availableModels = useMemo(
    () =>
      getAvailableModels(
        form.make,
        form.year,
        vehicles
          .filter(
            (vehicle) =>
              normalizeText(vehicle.make) === normalizeText(form.make) &&
              (!form.year || Number(vehicle.year) === Number(form.year))
          )
          .map((vehicle) => String(vehicle.model || ""))
      ),
    [form.make, form.year, vehicles]
  );

  useEffect(() => {
    const nextFuelType = getCatalogFuelType(form.make, form.year, form.model);
    if (nextFuelType && nextFuelType !== form.fuel_type) {
      setForm((current: typeof initialForm) => ({ ...current, fuel_type: nextFuelType }));
    }
  }, [form.make, form.year, form.model]);

  const filtered = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const term = search.toLowerCase();
        const currentLoan = activeLoanByVehicleId.get(vehicle.id);
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
    [vehicles, search, activeLoanByVehicleId, driverById]
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
      year: vehicle.year ? String(vehicle.year) : "",
      fuel_type: vehicle.fuel_type || "",
      current_km: vehicle.current_km || "",
      status: vehicle.status || "active",
    });
    setModalOpen(true);
  };

  const updateVehicleDriver = async (vehicleId: string, selectedDriverId: string) => {
    const currentLoan = activeLoanByVehicleId.get(vehicleId);
    const currentDriverId = currentLoan?.driver_id || "none";

    if (selectedDriverId === currentDriverId) {
      return;
    }

    try {
      setUpdatingDriverId(vehicleId);
      if (currentLoan?.id) {
        await api.put(`/loans/${currentLoan.id}`, {
          end_date: new Date().toISOString(),
        });
      }

      if (selectedDriverId !== "none") {
        await api.post("/loans", {
          vehicle_id: vehicleId,
          driver_id: selectedDriverId,
          start_date: new Date().toISOString(),
          reason: "Vínculo direto pela listagem de veículos",
        });
      }

      toast({
        title: selectedDriverId === "none" ? "Motorista removido" : "Motorista atualizado",
        description:
          selectedDriverId === "none"
            ? "O veículo ficou sem motorista vinculado."
            : "O motorista do veículo foi atualizado com sucesso.",
      });

      await loadVehicles();
    } catch (err) {
      toast({
        title: "Erro ao atualizar motorista",
        description: err instanceof ApiError ? err.message : "Não foi possível alterar o motorista do veículo.",
        variant: "destructive",
      });
    } finally {
      setUpdatingDriverId(null);
    }
  };

  const submit = async () => {
    try {
      setSaving(true);
      const payload = {
        plate: form.plate,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        fuel_type: form.fuel_type,
        current_km: Number(form.current_km),
        status: form.status,
      };

      if (editing) {
        await api.put(`/vehicle/${editing.id}`, payload);
      } else {
        await api.post<any>("/vehicle", payload);
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditing(null);
      await loadVehicles();
    } catch (err) {
      toast({
        title: "Erro ao salvar veículo",
        description: err instanceof ApiError ? err.message : "Não foi possível salvar o veículo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/vehicle/${id}`);
      await loadVehicles();
    } catch (err) {
      toast({
        title: "Erro ao excluir veículo",
        description: err instanceof ApiError ? err.message : "Não foi possível excluir o veículo.",
        variant: "destructive",
      });
    }
  };

  const updateVehicleStatus = async (vehicle: any, status: string) => {
    try {
      setUpdatingStatusId(vehicle.id);
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
      toast({
        title: "Erro ao atualizar status",
        description: err instanceof ApiError ? err.message : "Não foi possível atualizar o status do veículo.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 max-w-full space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground text-lg">{vehicles.length} veículos cadastrados</p>
        </div>
        <Button
          onClick={openCreate}
          className="h-12 w-full justify-center gap-2 px-4 text-base sm:w-auto sm:px-6 gradient-primary text-primary-foreground"
        >
          <Plus className="h-5 w-5 shrink-0" />
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

      {loading ? (
        <div className="glass-card p-4 text-sm text-muted-foreground">Carregando veículos...</div>
      ) : null}

      {!loading && (
        <div className="glass-card max-w-full overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full">
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
                const currentLoan = activeLoanByVehicleId.get(vehicle.id);
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
                    <td className="p-4 min-w-[240px]">
                      <Select
                        value={currentDriver?.id || "none"}
                        onValueChange={(value) => updateVehicleDriver(vehicle.id, value)}
                        disabled={updatingDriverId === vehicle.id}
                      >
                        <SelectTrigger className="h-10 bg-secondary border-border">
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
          </div>

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
              <div className="space-y-2">
                <Label>{fieldLabels.plate}</Label>
                <Input
                  value={form.plate}
                  onChange={(e) => setForm((current: typeof initialForm) => ({ ...current, plate: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                  placeholder="Ex.: ABC1D23"
                />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.make}</Label>
                <Input
                  list="vehicle-makes"
                  value={form.make}
                  onChange={(e) => {
                    const nextMake = e.target.value;
                    setForm((current: typeof initialForm) => ({
                      ...current,
                      make: nextMake,
                      year: normalizeText(current.make) === normalizeText(nextMake) ? current.year : "",
                      model: normalizeText(current.make) === normalizeText(nextMake) ? current.model : "",
                      fuel_type: "",
                    }));
                  }}
                  className="h-12 bg-secondary border-border"
                  placeholder="Digite ou selecione a marca"
                />
                <datalist id="vehicle-makes">
                  {availableMakes.map((make) => (
                    <option key={make} value={make} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.year}</Label>
                <Select
                  value={form.year || "placeholder"}
                  onValueChange={(value) =>
                    setForm((current: typeof initialForm) => ({
                      ...current,
                      year: value === "placeholder" ? "" : value,
                      model: "",
                      fuel_type: "",
                    }))
                  }
                  disabled={!form.make}
                >
                  <SelectTrigger className="h-12 bg-secondary border-border">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Selecione o ano
                    </SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.model}</Label>
                <Select
                  value={form.model || "placeholder"}
                  onValueChange={(value) =>
                    setForm((current: typeof initialForm) => ({
                      ...current,
                      model: value === "placeholder" ? "" : value,
                    }))
                  }
                  disabled={!form.make || !form.year}
                >
                  <SelectTrigger className="h-12 bg-secondary border-border">
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Selecione o modelo
                    </SelectItem>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.fuel_type}</Label>
<Input value={form.fuel_type} readOnly className="h-12 bg-secondary border-border opacity-80" placeholder="Preenchido automaticamente" />
              </div>

              <div className="space-y-2">
                <Label>{fieldLabels.current_km}</Label>
                <Input
                  type="number"
                  value={form.current_km}
                  onChange={(e) => setForm((current: typeof initialForm) => ({ ...current, current_km: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                  placeholder="Ex.: 10123"
                />
              </div>

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