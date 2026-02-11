import { motion } from "framer-motion";
import { FileText, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { monthlyFuelData } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const reportTypes = [
  { id: "fuel", name: "Gastos com Combustível", description: "Relatório detalhado de abastecimentos por veículo e motorista" },
  { id: "maintenance", name: "Manutenções", description: "Histórico completo de manutenções preventivas e corretivas" },
  { id: "km", name: "Quilometragem", description: "Controle de KM por veículo com análise de uso" },
  { id: "drivers", name: "Motoristas", description: "Relatório de desempenho e documentação dos motoristas" },
  { id: "fleet", name: "Visão Geral da Frota", description: "Resumo completo do status da frota" },
];

const AdminReports = () => {
  const handleExport = (format: string) => {
    toast({ title: `Exportando ${format.toUpperCase()}`, description: "O download começará em instantes." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground text-lg">Gere e exporte relatórios da sua frota</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Filtros</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Período</label>
            <Select defaultValue="month">
              <SelectTrigger className="h-12 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Veículo</label>
            <Select defaultValue="all">
              <SelectTrigger className="h-12 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="v1">ABC-1D23</SelectItem>
                <SelectItem value="v2">DEF-4G56</SelectItem>
                <SelectItem value="v4">JKL-0I12</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Motorista</label>
            <Select defaultValue="all">
              <SelectTrigger className="h-12 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="d1">Carlos Silva</SelectItem>
                <SelectItem value="d2">Ana Souza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Gastos Mensais</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyFuelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={14} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", color: "hsl(var(--foreground))" }} formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Custo"]} />
            <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Report Types */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Tipos de Relatório</h3>
        {reportTypes.map((report) => (
          <div key={report.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{report.name}</p>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1 border-border" onClick={() => handleExport("csv")}>
                <Download className="w-4 h-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-1 border-border" onClick={() => handleExport("pdf")}>
                <Download className="w-4 h-4" /> PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminReports;
