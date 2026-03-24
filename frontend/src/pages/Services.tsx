import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Clock, DollarSign } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', duration: 30, price: 0 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const res = await api.get('/services');
    setServices(res.data);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ name: '', description: '', duration: 30, price: 0 });
    setShowModal(true);
  }

  function openEdit(s: any) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', duration: s.duration, price: Number(s.price) });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await api.put(`/services/${editing.id}`, form);
    } else {
      await api.post('/services', form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (confirm('Remover este serviço?')) {
      await api.delete(`/services/${id}`);
      loadData();
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold">{s.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 rounded"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            {s.description && <p className="text-sm text-gray-500 mb-3">{s.description}</p>}
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-600"><Clock size={14} /> {s.duration}min</span>
              <span className="flex items-center gap-1 text-green-600 font-medium"><DollarSign size={14} /> R$ {Number(s.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duração (min)</label>
              <input type="number" className="input-field" min={5} step={5} value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço (R$)</label>
              <input type="number" className="input-field" min={0} step={0.01} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} required />
            </div>
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
