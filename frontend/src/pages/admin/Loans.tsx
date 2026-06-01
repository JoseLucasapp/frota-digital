import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, CalendarIcon, Plus, Search, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type LoanForm = {
  vehicle_id: string;
  driver_id: string;
  company_name: string;
  start_date: string;
  end_date: string;
  amount: string;
  reason: string;
};

const initialForm: LoanForm = {
  vehicle_id: "",
  driver_id: "",
  company_name: "",
  start_date: "",
  end_date: "",
  amount: "",
  reason: "",
};

const parseDateValue = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const formatDateValue = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : "");

const formatDisplayDate = (value: string) => {
  const date = parseDateValue(value);
  return date ? format(date, "dd/MM/yyyy") : "Selecione";
};

type DatePickerFieldProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

const DatePickerField = ({ value, placeholder, onChange }: DatePickerFieldProps) => {
  const selected = parseDateValue(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 w-full justify-start rounded-xl border-border bg-secondary px-3 text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {selected ? formatDisplayDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-border bg-popover p-0 shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(formatDateValue(date))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const AdminLoans = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<LoanForm>(initialForm);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [loanRes, vehicleRes, driverRes] = await Promise.all([
        api.get<{ data: any[] }>("/loans", { limit: 200 }),
        api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
        api.get<{ data: any[] }>("/driver", { limit: 200 }),
      ]);

      setLoans(loanRes.data || []);
      setVehicles(vehicleRes.data || []);
      setDrivers(driverRes.data || []);
    } catch (err) {
      toast({
        title: "Erro ao carregar empréstimos",
        description: err instanceof ApiError ? err.message : "Não foi possível carregar a lista de empréstimos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const vehiclesMap = useMemo(
    () => Object.fromEntries(vehicles.map((item) => [item.id, item])),
    [vehicles]
  );

  const driversMap = useMemo(
    () => Object.fromEntries(drivers.map((item) => [item.id, item])),
    [drivers]
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return loans;

    return loans.filter((loan) => {
      const vehicle = vehiclesMap[loan.vehicle_id];
      const driver = driversMap[loan.driver_id];

      return (
        String(vehicle?.plate || "").toLowerCase().includes(term) ||
        String(vehicle?.model || "").toLowerCase().includes(term) ||
        String(driver?.name || "").toLowerCase().includes(term) ||
        String(driver?.cpf || "").toLowerCase().includes(term) ||
        String(loan.company_name || "").toLowerCase().includes(term) ||
        String(loan.reason || "").toLowerCase().includes(term)
      );
    });
  }, [loans, search, vehiclesMap, driversMap]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (loan: any) => {
    setEditing(loan);
    setForm({
      vehicle_id: loan.vehicle_id || "",
      driver_id: loan.driver_id || "",
      company_name: loan.company_name || "",
      start_date: loan.start_date || "",
      end_date: loan.end_date || "",
      amount: loan.amount != null ? String(loan.amount) : "",
      reason: loan.reason || "",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        driver_id: form.driver_id || null,
        company_name: form.company_name.trim() || null,
        amount: form.amount === "" ? null : Number(form.amount),
        end_date: form.end_date || null,
      };

      if (editing) {
        await api.put(`/loans/${editing.id}`, payload);
      } else {
        await api.post("/loans", payload);
      }

      setModalOpen(false);
      setForm(initialForm);
      await loadAll();
    } catch (err) {
      toast({
        title: "Erro ao salvar empréstimo",
        description: err instanceof ApiError ? err.message : "Não foi possível salvar o empréstimo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeLoan = async (id: string) => {
    try {
      await api.delete(`/loans/${id}`);
      await loadAll();
    } catch (err) {
      toast({
        title: "Erro ao excluir empréstimo",
        description: err instanceof ApiError ? err.message : "Não foi possível excluir o empréstimo.",
        variant: "destructive",
      });
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
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Empréstimos</h1>
          <p className="text-muted-foreground text-lg">{loans.length} registros</p>
        </div>
        <Button onClick={openCreate} className="h-12 w-full justify-center gap-2 px-4 text-base sm:w-auto sm:px-6 gradient-primary text-primary-foreground">
          <Plus className="h-5 w-5 shrink-0" />
          Novo empréstimo
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por placa, empresa, motorista ou motivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base bg-secondary border-border"
        />
      </div>

      {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando empréstimos...</div> : null}

      {!loading && (
        <div className="glass-card max-w-full overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Veículo</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Empresa</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Motorista</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Início</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Fim</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Valor</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Motivo</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan) => {
                const vehicle = vehiclesMap[loan.vehicle_id];
                const driver = driversMap[loan.driver_id];

                return (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <ArrowLeftRight className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{vehicle?.plate || loan.vehicle_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {[vehicle?.make, vehicle?.model].filter(Boolean).join(" ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{loan.company_name || "—"}</td>
                    <td className="p-4 text-foreground">
                      {driver?.name || (loan.driver_id ? loan.driver_id : "Sem motorista")}
                      <br />
                      <span className="text-sm text-muted-foreground">{driver?.cpf || "—"}</span>
                    </td>
                    <td className="p-4 text-foreground">
                      {loan.start_date ? new Date(loan.start_date).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="p-4 text-foreground">
                      {loan.end_date ? new Date(loan.end_date).toLocaleDateString("pt-BR") : "Em aberto"}
                    </td>
                    <td className="p-4 text-foreground">
                      {loan.amount != null
                        ? `R$ ${Number(loan.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </td>
                    <td className="p-4 text-foreground">{loan.reason || "—"}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="outline" onClick={() => openEdit(loan)}>Editar</Button>
                      <Button variant="destructive" onClick={() => removeLoan(loan.id)}>Excluir</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>

          {!filtered.length ? <div className="p-4 text-sm text-muted-foreground">Nenhum empréstimo encontrado.</div> : null}
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
                {editing ? "Editar empréstimo" : "Novo empréstimo"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select
                  value={form.vehicle_id || "placeholder"}
                  onValueChange={(value) => setForm((current) => ({ ...current, vehicle_id: value === "placeholder" ? "" : value }))}
                >
                  <SelectTrigger className="h-12 bg-secondary border-border">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Selecione
                    </SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} — {[vehicle.make, vehicle.model].filter(Boolean).join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Motorista opcional</Label>
                <Select
                  value={form.driver_id || "none"}
                  onValueChange={(value) => setForm((current) => ({ ...current, driver_id: value === "none" ? "" : value }))}
                >
                  <SelectTrigger className="h-12 bg-secondary border-border">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Sem motorista
                    </SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} — {driver.cpf || driver.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              <div className="space-y-2 md:col-span-2">
                <Label>Empresa do empréstimo</Label>
                <Input
                  value={form.company_name}
                  onChange={(e) => setForm((current) => ({ ...current, company_name: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                  placeholder="Ex.: Prefeitura Municipal, Secretaria de Saúde, Empresa X"
                />
              </div>

              <div className="space-y-2">
                <Label>Data inicial</Label>
                <DatePickerField
                  value={form.start_date}
                  placeholder="Selecione a data inicial"
                  onChange={(value) => setForm((current) => ({ ...current, start_date: value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Data final</Label>
                <DatePickerField
                  value={form.end_date}
                  placeholder="Selecione a data final"
                  onChange={(value) => setForm((current) => ({ ...current, end_date: value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Valor do empréstimo</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                  placeholder="Ex.: 250,00"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Motivo</Label>
                <Input
                  value={form.reason}
                  onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))}
                  className="h-12 bg-secondary border-border"
                  placeholder="Descreva o motivo do empréstimo"
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

export default AdminLoans;