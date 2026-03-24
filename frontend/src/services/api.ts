const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
}

export const api = {
  get: <T = any>(url: string) => request<T>(url),
  post: <T = any>(url: string, body: any) => request<T>(url, { method: 'POST', body }),
  put: <T = any>(url: string, body: any) => request<T>(url, { method: 'PUT', body }),
  patch: <T = any>(url: string, body?: any) => request<T>(url, { method: 'PATCH', body }),
  delete: <T = any>(url: string) => request<T>(url, { method: 'DELETE' }),
};
