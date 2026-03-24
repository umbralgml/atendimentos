import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em Atendimento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não Compareceu',
};

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [newAppointment, setNewAppointment] = useState({
    professionalId: '', serviceId: '', clientId: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '', notes: '',
  });

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (view === 'day') {
        const params = `?date=${dateStr}${selectedProfessional ? `&professionalId=${selectedProfessional}` : ''}`;
        const res = await api.get(`/appointments/day${params}`);
        setAppointments(res.data);
      } else {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        const params = `?startDate=${format(weekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}${selectedProfessional ? `&professionalId=${selectedProfessional}` : ''}`;
        const res = await api.get(`/appointments/week${params}`);
        setAppointments(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, [currentDate, view, selectedProfessional]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    Promise.all([
      api.get('/professionals'),
      api.get('/services'),
      api.get('/clients'),
    ]).then(([p, s, c]) => {
      setProfessionals(p.data);
      setServices(s.data);
      setClients(c.data?.data || c.data);
    });
  }, []);

  useEffect(() => {
    if (newAppointment.professionalId && newAppointment.date && newAppointment.serviceId) {
      api.get(`/appointments/slots?professionalId=${newAppointment.professionalId}&date=${newAppointment.date}&serviceId=${newAppointment.serviceId}`)
        .then((res) => setAvailableSlots(res.data))
        .catch(() => setAvailableSlots([]));
    }
  }, [newAppointment.professionalId, newAppointment.date, newAppointment.serviceId]);

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/appointments', newAppointment);
      setShowNewModal(false);
      setNewAppointment({ professionalId: '', serviceId: '', clientId: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '', notes: '' });
      loadAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    await api.put(`/appointments/${id}`, { status });
    loadAppointments();
  }

  async function handleCancel(id: string) {
    if (confirm('Cancelar este agendamento?')) {
      await api.patch(`/appointments/${id}/cancel`);
      loadAppointments();
    }
  }

  function navigateDate(direction: number) {
    setCurrentDate((prev) => addDays(prev, direction * (view === 'week' ? 7 : 1)));
  }

  const weekDays = view === 'week'
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      {/* Controls */}
      <div className="card flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
          <span className="font-medium min-w-[200px] text-center">
            {view === 'day'
              ? format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
              : `${format(weekDays[0] || currentDate, 'dd/MM')} - ${format(weekDays[6] || currentDate, 'dd/MM/yyyy')}`}
          </span>
          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
        </div>

        <button onClick={() => setCurrentDate(new Date())} className="btn-secondary text-sm">Hoje</button>

        <div className="flex rounded-lg border overflow-hidden">
          <button onClick={() => setView('day')} className={`px-3 py-1.5 text-sm ${view === 'day' ? 'bg-primary-600 text-white' : 'bg-white'}`}>Dia</button>
          <button onClick={() => setView('week')} className={`px-3 py-1.5 text-sm ${view === 'week' ? 'bg-primary-600 text-white' : 'bg-white'}`}>Semana</button>
        </div>

        <select className="input-field max-w-xs" value={selectedProfessional} onChange={(e) => setSelectedProfessional(e.target.value)}>
          <option value="">Todos os profissionais</option>
          {professionals.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Appointments */}
      {loading ? (
        <LoadingSpinner />
      ) : view === 'day' ? (
        <div className="space-y-2">
          {appointments.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">Nenhum agendamento para este dia</div>
          ) : (
            appointments.map((apt: any) => (
              <div key={apt.id} className={`card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 ${statusColors[apt.status]}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{apt.startTime}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-gray-500">{apt.endTime}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[apt.status]}`}>
                      {statusLabels[apt.status]}
                    </span>
                  </div>
                  <p className="font-medium">{apt.client.name}</p>
                  <p className="text-sm text-gray-500">{apt.service.name} - {apt.professional.name}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {apt.status === 'SCHEDULED' && (
                    <>
                      <button onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')} className="text-xs btn-secondary">Confirmar</button>
                      <button onClick={() => handleCancel(apt.id)} className="text-xs btn-danger">Cancelar</button>
                    </>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <button onClick={() => handleUpdateStatus(apt.id, 'IN_PROGRESS')} className="text-xs btn-primary">Iniciar</button>
                  )}
                  {apt.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')} className="text-xs btn-primary">Concluir</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter((a: any) => isSameDay(new Date(a.date), day));
            return (
              <div key={day.toISOString()} className="card min-h-[200px]">
                <p className={`text-sm font-medium mb-2 ${isSameDay(day, new Date()) ? 'text-primary-600' : 'text-gray-500'}`}>
                  {format(day, 'EEE dd', { locale: ptBR })}
                </p>
                <div className="space-y-1">
                  {dayAppointments.map((apt: any) => (
                    <div key={apt.id} className={`text-xs p-1.5 rounded border ${statusColors[apt.status]}`}>
                      <p className="font-medium">{apt.startTime}</p>
                      <p className="truncate">{apt.client.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Appointment Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Novo Agendamento" size="lg">
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profissional</label>
            <select className="input-field" value={newAppointment.professionalId}
              onChange={(e) => setNewAppointment((p) => ({ ...p, professionalId: e.target.value }))} required>
              <option value="">Selecione...</option>
              {professionals.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Serviço</label>
            <select className="input-field" value={newAppointment.serviceId}
              onChange={(e) => setNewAppointment((p) => ({ ...p, serviceId: e.target.value }))} required>
              <option value="">Selecione...</option>
              {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.duration}min - R$ {s.price})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select className="input-field" value={newAppointment.clientId}
              onChange={(e) => setNewAppointment((p) => ({ ...p, clientId: e.target.value }))} required>
              <option value="">Selecione...</option>
              {(Array.isArray(clients) ? clients : []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input type="date" className="input-field" value={newAppointment.date}
              onChange={(e) => setNewAppointment((p) => ({ ...p, date: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horário</label>
            {availableSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                  <button key={slot} type="button"
                    onClick={() => setNewAppointment((p) => ({ ...p, startTime: slot }))}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${newAppointment.startTime === slot ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-50'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Selecione profissional, serviço e data para ver horários</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea className="input-field" rows={2} value={newAppointment.notes}
              onChange={(e) => setNewAppointment((p) => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowNewModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={!newAppointment.startTime}>Agendar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
