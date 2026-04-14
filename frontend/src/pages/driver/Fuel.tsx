import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Fuel, Upload } from "lucide-react";
import { api, ApiError, API_BASE } from "@/lib/api";
import { getAuthUser, getAuthToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const initialForm = {
  liters: "",
  price_per_liter: "",
  current_km: "",
  station: "",
  fuel_type: "",
};

const DriverFuelPage = () => {
  const user = getAuthUser();
  const token = getAuthToken();
  const navigate = useNavigate();

  const [loans, setLoans] = useState<any[]>([]);
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [form, setForm] = useState(initialForm);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadContext = async () => {
    try {
      setBootLoading(true);
      setError(null);

      const [loanRes, vehicleRes, fuelingRes] = await Promise.all([
        api.get<{ data: any[] }>("/loans", { limit: 200 }),
        api.get<{ data: any[] }>("/vehicle", { limit: 200 }),
        api.get<{ data: any[] }>("/fueling", { limit: 200 }),
      ]);

      const myLoans = (loanRes.data || []).filter((loan) => loan.driver_id === user?.id);
      const latestLoan = myLoans.sort(
        (a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
      )[0];

      const currentVehicle =
        (vehicleRes.data || []).find((item) => item.id === latestLoan?.vehicle_id) || null;

      setLoans(myLoans);
      setVehicle(currentVehicle);
      setFuelings(
        (fuelingRes.data || []).filter((item) => item.vehicle_id === currentVehicle?.id)
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar abastecimentos");
    } finally {
      setBootLoading(false);
    }
  };

  useEffect(() => {
    loadContext();
  }, [user?.id]);

  const totalSpent = useMemo(
    () =>
      fuelings.reduce((sum, item) => {
        const total = Number(
          item.total_price || Number(item.liters || 0) * Number(item.price_per_liter || 0)
        );
        return sum + total;
      }, 0),
    [fuelings]
  );

  const uploadReceiptToBackend = async (fuelingId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/fueling/${fuelingId}/receipt`, {
      method: "POST",
      headers: token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : undefined,
      body: formData,
    });

    const text = await response.text();
    let payload: any = null;

    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new Error(payload?.message || "Erro ao enviar comprovante");
    }

    return payload;
  };

  const saveFueling = async () => {
    if (!vehicle?.id) {
      setError("Nenhum veículo associado ao motorista.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const created = await api.post<any>("/fueling", {
        vehicle_id: vehicle.id,
        fuel_type: form.fuel_type,
        liters: Number(form.liters),
        price_per_liter: Number(form.price_per_liter),
        current_km: Number(form.current_km),
        station: form.station,
      });

      const fuelingId =
        created?.data?.id ||
        created?.id ||
        created?.data?.data?.id;

      if (!fuelingId) {
        throw new Error("Abastecimento criado, mas o ID não retornou da API.");
      }

      if (receiptFile) {
        await uploadReceiptToBackend(fuelingId, receiptFile);
      }

      setMessage("Abastecimento registrado com sucesso");
      setForm(initialForm);
      setReceiptFile(null);
      await loadContext();
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err?.message || "Erro ao salvar abastecimento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">

      <div>
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate("/driver")} className="text-primary-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Abastecimentos</h1>
        </div>
        <p className="text-muted-foreground">
          {vehicle ? `Veículo atual: ${vehicle.plate}` : "Nenhum veículo ativo"}
        </p>
      </div>

      {bootLoading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando...</div> : null}
      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {message ? <div className="glass-card p-4 text-sm text-green-600">{message}</div> : null}

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Novo abastecimento</h2>

          <div className="space-y-2">
            <Label>Combustível</Label>
            <Input
              value={form.fuel_type}
              onChange={(e) => setForm((current) => ({ ...current, fuel_type: e.target.value }))}
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Litros</Label>
            <Input
              type="number"
              value={form.liters}
              onChange={(e) => setForm((current) => ({ ...current, liters: e.target.value }))}
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Preço por litro</Label>
            <Input
              type="number"
              value={form.price_per_liter}
              onChange={(e) => setForm((current) => ({ ...current, price_per_liter: e.target.value }))}
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>KM atual</Label>
            <Input
              type="number"
              value={form.current_km}
              onChange={(e) => setForm((current) => ({ ...current, current_km: e.target.value }))}
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Posto</Label>
            <Input
              value={form.station}
              onChange={(e) => setForm((current) => ({ ...current, station: e.target.value }))}
              className="h-12 bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Comprovante</Label>
            <label className="h-12 px-4 rounded-md border border-border bg-secondary flex items-center gap-3 cursor-pointer">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {receiptFile ? receiptFile.name : "Selecionar arquivo"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <Button
            disabled={loading || !vehicle}
            onClick={saveFueling}
            className="w-full h-12 text-base gradient-primary text-primary-foreground"
          >
            {loading ? "Salvando..." : "Registrar abastecimento"}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <Fuel className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-bold text-foreground">
              R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">Total registrado</p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Histórico</h2>

            {fuelings.map((item) => {
              const total = Number(
                item.total_price || Number(item.liters || 0) * Number(item.price_per_liter || 0)
              );

              return (
                <div key={item.id} className="p-4 rounded-xl bg-secondary/40">
                  <p className="font-medium text-foreground">
                    {item.fuel_type} — R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.station} • {item.liters}L • KM {Number(item.current_km || 0).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "Sem data"}
                  </p>

                  {item.receipt_url ? (
                    <a
                      href={item.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-sm text-primary hover:underline"
                    >
                      Ver comprovante
                    </a>
                  ) : null}
                </div>
              );
            })}

            {!fuelings.length ? (
              <p className="text-sm text-muted-foreground">Nenhum abastecimento encontrado.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverFuelPage;