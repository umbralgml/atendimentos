import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Scissors, Clock } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardData {
  totalClients: number;
  totalProfessionals: number;
  todayAppointments: number;
  upcomingAppointments: any[];
}

export default function Dashboard() {
  const { tenant } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tenant/dashboard').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = [
    { label: 'Agendamentos Hoje', value: data?.todayAppointments || 0, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Clientes', value: data?.totalClients || 0, icon: Users, color: 'bg-green-500' },
    { label: 'Profissionais', value: data?.totalProfessionals || 0, icon: Scissors, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">{tenant?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary-600" />
          Próximos Agendamentos
        </h2>
        {!data?.upcomingAppointments?.length ? (
          <p className="text-gray-400 text-sm py-4 text-center">Nenhum agendamento próximo</p>
        ) : (
          <div className="divide-y">
            {data.upcomingAppointments.map((apt: any) => (
              <div key={apt.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{apt.client.name}</p>
                  <p className="text-sm text-gray-500">
                    {apt.service.name} com {apt.professional.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{apt.startTime} - {apt.endTime}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(apt.date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
