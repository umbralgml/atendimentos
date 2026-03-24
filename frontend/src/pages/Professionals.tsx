import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Professionals() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', serviceIds: [] as string[] });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [p, s] = await Promise.all([api.get('/professionals'), api.get('/services')]);
    setProfessionals(p.data);
    setServices(s.data);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', serviceIds: [] });
    setShowModal(true);
  }

  function openEdit(p: any) {
    setEditing(p);
    setForm({ name: p.name, phone: p.phone || '', email: p.email || '', serviceIds: p.services?.map((s: any) => s.serviceId) || [] });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await api.put(`/professionals/${editing.id}`, form);
    } else {
      await api.post('/professionals', form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (confirm('Remover este profissional?')) {
      await api.delete(`/professionals/${id}`);
      loadData();
    }
  }

  function toggleService(id: string) {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id) ? prev.serviceIds.filter((s) => s !== id) : [...prev.serviceIds, id],
    }));
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profissionais</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                {p.phone && <p className="text-sm text-gray-500">{p.phone}</p>}
                {p.email && <p className="text-sm text-gray-500">{p.email}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            {p.services?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {p.services.map((s: any) => (
                  <span key={s.serviceId} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                    {s.service.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Profissional' : 'Novo Profissional'}>
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
            <label className="block text-sm font-medium mb-1">Serviços</label>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button key={s.id} type="button" onClick={() => toggleService(s.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${form.serviceIds.includes(s.id) ? 'bg-primary-600 text-white' : 'hover:bg-gray-50'}`}>
                  {s.name}
                </button>
              ))}
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
