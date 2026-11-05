const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'No se pudo completar la solicitud');
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  getEmpleados: () => request('/empleados'),
  getAreas: () => request('/areas'),
  createEmpleado: (data) => request('/empleados', { method: 'POST', body: JSON.stringify(data) }),
  updateEmpleado: (id, data) =>
    request(`/empleados/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmpleado: (id) => request(`/empleados/${id}`, { method: 'DELETE' }),
};
