import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Fuel, Wrench, Car, Users, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminReports = () => {
  const [fuelings, setFuelings] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const [fuelingRes, maintenanceRes, vehicleRes, driverRes] = await Promise.all([
          api.get<{ data: any[] }>("/fueling", { limit: 500 }),
          api.get<{ data: any[] }>("/maintenances", { limit: 500 }),
          api.get<{ data: any[] }>("/vehicle", { limit: 500 }),
          api.get<{ data: any[] }>("/driver", { limit: 500 }),
        ]);

        setFuelings(fuelingRes.data || []);
        setMaintenances(maintenanceRes.data || []);
        setVehicles(vehicleRes.data || []);
        setDrivers(driverRes.data || []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Erro ao carregar relatórios");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const vehicleMap = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles]
  );

  const isWithinDateRange = (value: string | null | undefined) => {
    if (!value) return true;

    const current = new Date(value);
    if (Number.isNaN(current.getTime())) return true;

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      if (current < start) return false;
    }

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59`);
      if (current > end) return false;
    }

    return true;
  };

  const filteredFuelings = useMemo(() => {
    return fuelings.filter((item) =>
      isWithinDateRange(item.created_at || item.date)
    );
  }, [fuelings, startDate, endDate]);

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((item) =>
      isWithinDateRange(item.created_at || item.updated_at)
    );
  }, [maintenances, startDate, endDate]);

  const totalFuelCost = useMemo(() => {
    return filteredFuelings.reduce((sum, item) => {
      const total = Number(
        item.total_price ||
        Number(item.liters || 0) * Number(item.price_per_liter || 0)
      );
      return sum + total;
    }, 0);
  }, [filteredFuelings]);

  const totalMaintenanceCost = useMemo(() => {
    return filteredMaintenances.reduce((sum, item) => {
      return sum + Number(item.estimated_cost || 0);
    }, 0);
  }, [filteredMaintenances]);

  const pendingMaintenances = useMemo(() => {
    return filteredMaintenances.filter((item) =>
      String(item.status || "").toLowerCase().includes("pending")
    ).length;
  }, [filteredMaintenances]);

  const reportData = useMemo(() => {
    const map = new Map<string, { fuel: number; maintenance: number }>();

    filteredFuelings.forEach((item) => {
      const month = new Date(
        item.created_at || item.date || new Date().toISOString()
      ).toLocaleDateString("pt-BR", { month: "short" });

      const total = Number(
        item.total_price ||
        Number(item.liters || 0) * Number(item.price_per_liter || 0)
      );

      const current = map.get(month) || { fuel: 0, maintenance: 0 };
      current.fuel += total;
      map.set(month, current);
    });

    filteredMaintenances.forEach((item) => {
      const month = new Date(
        item.created_at || item.updated_at || new Date().toISOString()
      ).toLocaleDateString("pt-BR", { month: "short" });

      const total = Number(item.estimated_cost || 0);

      const current = map.get(month) || { fuel: 0, maintenance: 0 };
      current.maintenance += total;
      map.set(month, current);
    });

    return Array.from(map.entries()).map(([month, values]) => ({
      month,
      fuel: values.fuel,
      maintenance: values.maintenance,
    }));
  }, [filteredFuelings, filteredMaintenances]);

  const exportCSV = () => {
    const rows = [
      ["Tipo", "Data", "Veículo", "Detalhe", "Valor"],
      ...filteredFuelings.map((item) => {
        const vehicle = vehicleMap[item.vehicle_id];
        const total = Number(
          item.total_price ||
          Number(item.liters || 0) * Number(item.price_per_liter || 0)
        );

        return [
          "Abastecimento",
          item.created_at || item.date || "",
          vehicle?.plate || item.vehicle_id || "",
          `${item.fuel_type || ""} - ${item.station || ""}`,
          total.toFixed(2),
        ];
      }),
      ...filteredMaintenances.map((item) => {
        const vehicle = vehicleMap[item.vehicle_id];

        return [
          "Manutenção",
          item.created_at || item.updated_at || "",
          vehicle?.plate || item.vehicle_id || "",
          `${item.type || ""} - ${item.description || ""}`,
          Number(item.estimated_cost || 0).toFixed(2),
        ];
      }),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const suffix =
      startDate || endDate
        ? `_${startDate || "inicio"}_${endDate || "fim"}`
        : "";

    link.setAttribute("download", `relatorio_frota${suffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 print:p-0"
    >
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground text-lg">
            Resumo consolidado de abastecimentos e manutenções
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button onClick={exportPDF} className="gap-2 gradient-primary text-primary-foreground">
            <Printer className="w-4 h-4" />
            Salvar / Imprimir PDF
          </Button>
        </div>
      </div>

      <div className="glass-card p-4 print:hidden">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data inicial</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data final</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="w-full"
            >
              Limpar filtro
            </Button>
          </div>
        </div>
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando relatórios...</div> : null}

      {!loading && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="glass-card p-5">
              <Fuel className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">
                R$ {totalFuelCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Gasto com combustível</p>
            </div>

            <div className="glass-card p-5">
              <Wrench className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">
                R$ {totalMaintenanceCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Custo estimado de manutenção</p>
            </div>

            <div className="glass-card p-5">
              <Car className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{vehicles.length}</p>
              <p className="text-sm text-muted-foreground">Veículos cadastrados</p>
            </div>

            <div className="glass-card p-5">
              <Users className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{pendingMaintenances}</p>
              <p className="text-sm text-muted-foreground">Manutenções pendentes</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Gastos por mês
            </h3>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    name === "fuel" ? "Combustível" : "Manutenção",
                  ]}
                />
                <Bar dataKey="fuel" name="Combustível" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="maintenance" name="Manutenção" fill="hsl(var(--ring))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Últimos abastecimentos</h3>

              {filteredFuelings
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.created_at || b.date || 0).getTime() -
                    new Date(a.created_at || a.date || 0).getTime()
                )
                .slice(0, 10)
                .map((item) => {
                  const vehicle = vehicleMap[item.vehicle_id];
                  const total = Number(
                    item.total_price ||
                    Number(item.liters || 0) * Number(item.price_per_liter || 0)
                  );

                  return (
                    <div key={item.id} className="p-4 rounded-xl bg-secondary/40">
                      <p className="font-medium text-foreground">
                        {vehicle?.plate || item.vehicle_id} — {item.fuel_type || "Combustível"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.station || "Posto não informado"} • {item.liters || 0}L • R${" "}
                        {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.created_at || item.date
                          ? new Date(item.created_at || item.date).toLocaleString("pt-BR")
                          : "Sem data"}
                      </p>
                    </div>
                  );
                })}

              {!filteredFuelings.length ? (
                <p className="text-sm text-muted-foreground">Nenhum abastecimento encontrado.</p>
              ) : null}
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Últimas manutenções</h3>

              {filteredMaintenances
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.created_at || b.updated_at || 0).getTime() -
                    new Date(a.created_at || a.updated_at || 0).getTime()
                )
                .slice(0, 10)
                .map((item) => {
                  const vehicle = vehicleMap[item.vehicle_id];

                  return (
                    <div key={item.id} className="p-4 rounded-xl bg-secondary/40">
                      <p className="font-medium text-foreground">
                        {vehicle?.plate || item.vehicle_id} — {item.type || "Manutenção"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description || "Sem descrição"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Status: {item.status || "—"} • Custo estimado: R${" "}
                        {Number(item.estimated_cost || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.created_at || item.updated_at
                          ? new Date(item.created_at || item.updated_at).toLocaleString("pt-BR")
                          : "Sem data"}
                      </p>
                    </div>
                  );
                })}

              {!filteredMaintenances.length ? (
                <p className="text-sm text-muted-foreground">Nenhuma manutenção encontrada.</p>
              ) : null}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AdminReports;