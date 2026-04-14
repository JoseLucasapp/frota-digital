import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

const initialForm = { name: '', cnpj: '', email: '', phone: '', password: '' };

const AdminMechanics = () => {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadMechanics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: any[] }>("/mechanic", { limit: 200 });
      setMechanics(response.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar mecânicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMechanics(); }, []);

  const filtered = useMemo(() => mechanics.filter((mechanic) => {
    const term = search.toLowerCase();
    return !term || String(mechanic.name || '').toLowerCase().includes(term) || String(mechanic.cnpj || '').includes(term) || String(mechanic.email || '').toLowerCase().includes(term);
  }), [mechanics, search]);

  const openCreate = () => { setEditing(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (mechanic: any) => { setEditing(mechanic); setForm({ name: mechanic.name || '', cnpj: mechanic.cnpj || '', email: mechanic.email || '', phone: mechanic.phone || '', password: '' }); setModalOpen(true); };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);
      if (editing) {
        const payload = { ...form } as any;
        if (!payload.password) delete payload.password;
        await api.put(`/mechanic/${editing.id}`, payload);
      } else {
        await api.post('/mechanic', form);
      }
      setModalOpen(false);
      await loadMechanics();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar mecânico');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/mechanic/${id}`);
      await loadMechanics();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir mecânico');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mecânicos</h1>
          <p className="text-muted-foreground text-lg">{mechanics.length} mecânicos cadastrados</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-primary-foreground h-12 px-6 text-base gap-2"><Plus className="w-5 h-5" /> Novo mecânico</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar por nome, CNPJ ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 text-base bg-secondary border-border" />
      </div>

      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {loading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando mecânicos...</div> : null}

      {!loading && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Nome</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Contato</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">CNPJ</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mechanic) => (
                <tr key={mechanic.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Wrench className="w-5 h-5 text-primary" /></div><div><p className="font-medium text-foreground">{mechanic.name}</p></div></div>
                  </td>
                  <td className="p-4 text-foreground">{mechanic.email}<br /><span className="text-sm text-muted-foreground">{mechanic.phone || '—'}</span></td>
                  <td className="p-4 text-foreground">{mechanic.cnpj || '—'}</td>
                  <td className="p-4"><Badge>{mechanic.status || '—'}</Badge></td>
                  <td className="p-4 text-right space-x-2"><Button variant="outline" onClick={() => openEdit(mechanic)}>Editar</Button><Button variant="destructive" onClick={() => remove(mechanic.id)}>Excluir</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <div className="p-4 text-sm text-muted-foreground">Nenhum mecânico encontrado.</div> : null}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="glass-card w-full max-w-2xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-foreground">{editing ? 'Editar mecânico' : 'Novo mecânico'}</h2><button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button></div>
            <div className="grid md:grid-cols-2 gap-4">
              {['name', 'cnpj', 'email', 'phone'].map((key) => (<div key={key} className="space-y-2"><Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label><Input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="h-12 bg-secondary border-border" /></div>))}
            </div>
            <Button disabled={saving} onClick={submit} className="w-full h-12 text-base gradient-primary text-primary-foreground">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminMechanics;