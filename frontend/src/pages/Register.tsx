import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    tenantName: '',
    tenantSlug: '',
    segment: 'GENERAL',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'tenantName' ? { tenantSlug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  const segments = [
    { value: 'GENERAL', label: 'Prestador de Serviços' },
    { value: 'CLINIC', label: 'Clínica' },
    { value: 'SALON', label: 'Salão de Beleza' },
    { value: 'BARBERSHOP', label: 'Barbearia' },
    { value: 'MANICURE', label: 'Manicure' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Calendar size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Cadastro</h1>
          <p className="text-primary-200 text-sm mt-1">Crie sua conta gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
            <select name="segment" className="input-field" value={form.segment} onChange={handleChange}>
              {segments.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <input type="text" name="tenantName" className="input-field" placeholder="Minha Empresa" value={form.tenantName} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identificador</label>
            <input type="text" name="tenantSlug" className="input-field" placeholder="minha-empresa" value={form.tenantSlug} onChange={handleChange} required />
            <p className="text-xs text-gray-400 mt-1">Usado para login. Apenas letras minúsculas, números e hífens.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
            <input type="text" name="name" className="input-field" placeholder="Seu nome completo" value={form.name} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" className="input-field" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" name="password" className="input-field" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
