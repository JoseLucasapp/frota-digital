import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

const statusMap: Record<string, string> = {
  active: "bg-success/20 text-success border-0",
  inactive: "bg-muted text-muted-foreground border-0",
  suspended: "bg-destructive/20 text-destructive border-0",
};

const initialForm = { name: '', cpf: '', email: '', phone: '', cnh_category: '', cnh_valid_until: '', password: '' };

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<any | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: any[] }>("/driver", { limit: 200 });
      setDrivers(response.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, []);

  const filtered = useMemo(() => drivers.filter((driver) => {
    const term = search.toLowerCase();
    return !term || String(driver.name || '').toLowerCase().includes(term) || String(driver.cpf || '').includes(term) || String(driver.email || '').toLowerCase().includes(term);
  }), [drivers, search]);

  const openCreate = () => { setEditDriver(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (driver: any) => {
    setEditDriver(driver);
    setForm({
      name: driver.name || '',
      cpf: driver.cpf || '',
      email: driver.email || '',
      phone: driver.phone || '',
      cnh_category: driver.cnh_category || '',
      cnh_valid_until: driver.cnh_valid_until ? String(driver.cnh_valid_until).slice(0, 10) : '',
      password: '',
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);
      if (editDriver) {
        const payload = { ...form } as any;
        if (!payload.password) delete payload.password;
        await api.put(`/driver/${editDriver.id}`, payload);
      } else {
        await api.post('/driver', form);
      }
      setModalOpen(false);
      setForm(initialForm);
      await loadDrivers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar motorista');
    } finally {
      setSaving(false);
    }
  };

  const removeDriver = async (id: string) => {
    try {
      await api.delete(`/driver/${id}`);
      await loadDrivers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir motorista');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Motoristas</h1>
          <p className="text-muted-foreground text-lg">{drivers.length} motoristas cadastrados</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2"><Plus className="w-5 h-5" /> Novo motorista</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar por nome, CPF ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando motoristas...</div> : null}

      {!loading && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Nome</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Contato</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">CNH</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((driver) => (
                <tr key={driver.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
                      <div>
                        <p className="font-medium text-foreground">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">CPF: {driver.cpf || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{driver.email}<br /><span className="text-sm text-muted-foreground">{driver.phone || '—'}</span></td>
                  <td className="p-4 text-foreground">{driver.cnh_category || '—'}<br /><span className="text-sm text-muted-foreground">{driver.cnh_valid_until ? new Date(driver.cnh_valid_until).toLocaleDateString('pt-BR') : 'Sem validade'}</span></td>
                  <td className="p-4"><Badge className={statusMap[String(driver.status).toLowerCase()] || 'border-0'}>{driver.status || '—'}</Badge></td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="outline" onClick={() => openEdit(driver)}>Editar</Button>
                    <Button variant="destructive" onClick={() => removeDriver(driver.id)}>Excluir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <div className="p-4 text-sm text-muted-foreground">Nenhum motorista encontrado.</div> : null}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="glass-card w-full max-w-2xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{editDriver ? 'Editar motorista' : 'Novo motorista'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ['Nome', 'name'],
                ['CPF', 'cpf'],
                ['Email', 'email'],
                ['Telefone', 'phone'],
                ['Categoria CNH', 'cnh_category'],
              ].map(([label, key]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="h-12 bg-secondary border-border" />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Validade CNH</Label>
                <Input type="date" value={form.cnh_valid_until} onChange={(e) => setForm((current) => ({ ...current, cnh_valid_until: e.target.value }))} className="h-12 bg-secondary border-border" />
              </div>
            </div>
            <Button disabled={saving} onClick={submit} className="w-full h-12 text-base gradient-primary text-primary-foreground">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDrivers;