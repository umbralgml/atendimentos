import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Search, Phone, Mail } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });

  useEffect(() => { loadData(); }, [search]);

  async function loadData() {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await api.get(`/clients${params}`);
    setClients(res.data || res.data?.data || []);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', notes: '' });
    setShowModal(true);
  }

  function openEdit(c: any) {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', notes: c.notes || '' });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await api.put(`/clients/${editing.id}`, form);
    } else {
      await api.post('/clients', form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (confirm('Remover este cliente?')) {
      await api.delete(`/clients/${id}`);
      loadData();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo</button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          className="input-field pl-10"
          placeholder="Buscar por nome, telefone ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(clients) ? clients : []).map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{c.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                {c.phone && <p className="flex items-center gap-1"><Phone size={14} /> {c.phone}</p>}
                {c.email && <p className="flex items-center gap-1"><Mail size={14} /> {c.email}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
