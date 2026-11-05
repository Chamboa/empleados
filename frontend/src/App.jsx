import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Mail, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { api } from './api.js';

const emptyForm = {
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  documento: '',
  fechaNacimiento: '',
  fechaIngreso: new Date().toISOString().slice(0, 10),
  cargo: '',
  areaId: '',
};

function App() {
  const [empleados, setEmpleados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [employeesData, areasData] = await Promise.all([api.getEmpleados(), api.getAreas()]);
      setEmpleados(employeesData);
      setAreas(areasData);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return empleados;
    return empleados.filter((employee) =>
      [employee.NombreCompleto, employee.Correo, employee.AreaNombre, employee.Cargo]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [empleados, search]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, areaId: areas[0]?.AreaId || '' });
    setModalOpen(true);
    setError('');
  }

  function openEdit(employee) {
    setEditingId(employee.EmpleadoId);
    setForm({
      nombre: employee.Nombre,
      apellido: employee.Apellido,
      correo: employee.Correo,
      telefono: employee.Telefono || '',
      documento: employee.Documento || '',
      fechaNacimiento: employee.FechaNacimiento?.slice(0, 10) || '',
      fechaIngreso: employee.FechaIngreso?.slice(0, 10) || '',
      cargo: employee.Cargo || '',
      areaId: employee.AreaId,
      activo: employee.Activo,
    });
    setModalOpen(true);
    setError('');
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await api.updateEmpleado(editingId, form);
      else await api.createEmpleado(form);
      setModalOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(employee) {
    if (!window.confirm(`¿Dar de baja a ${employee.NombreCompleto}?`)) return;
    try {
      await api.deleteEmpleado(employee.EmpleadoId);
      await loadData();
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Users size={20} /></div><span>People<span className="brand-accent">Desk</span></span></div>
        <div className="nav-label">GESTIÓN</div>
        <div className="nav-item active"><Users size={18} /> Empleados</div>
        <div className="nav-item"><BriefcaseBusiness size={18} /> Áreas de trabajo</div>
        <div className="sidebar-footer">Panel administrativo<br /><span>Gestión de talento</span></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">PANEL DE CONTROL</p><h1>Empleados</h1></div><button className="primary-button" onClick={openCreate}><Plus size={18} /> Nuevo empleado</button></header>
        <section className="stats">
          <div className="stat-card"><div className="stat-icon blue"><Users size={20} /></div><div><span>Total empleados</span><strong>{empleados.length}</strong></div></div>
          <div className="stat-card"><div className="stat-icon green"><BriefcaseBusiness size={20} /></div><div><span>Áreas activas</span><strong>{areas.length}</strong></div></div>
          <div className="stat-card"><div className="stat-icon orange"><Mail size={20} /></div><div><span>Resultados</span><strong>{filteredEmployees.length}</strong></div></div>
        </section>
        <section className="table-card">
          <div className="table-header"><div><h2>Directorio de empleados</h2><p>Consulta y administra el personal registrado.</p></div><label className="search-box"><Search size={18} /><input placeholder="Buscar por nombre, correo o área..." value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
          {error && <div className="alert">{error}</div>}
          {loading ? <div className="empty-state">Cargando empleados...</div> : filteredEmployees.length === 0 ? <div className="empty-state">No hay empleados que coincidan con la búsqueda.</div> : <div className="table-wrap"><table><thead><tr><th>EMPLEADO</th><th>CONTACTO</th><th>ÁREA</th><th>CARGO</th><th>ESTADO</th><th></th></tr></thead><tbody>{filteredEmployees.map((employee) => <tr key={employee.EmpleadoId}><td><div className="employee-cell"><div className="avatar">{employee.Nombre[0]}{employee.Apellido[0]}</div><div><strong>{employee.NombreCompleto}</strong><small>Ingreso: {employee.FechaIngreso?.slice(0, 10)}</small></div></div></td><td><span className="email">{employee.Correo}</span><small>{employee.Telefono || 'Sin teléfono'}</small></td><td><span className="area-pill">{employee.AreaNombre}</span></td><td>{employee.Cargo || 'Sin cargo'}</td><td><span className="status"><i />Activo</span></td><td><div className="actions"><button title="Editar" onClick={() => openEdit(employee)}><Pencil size={16} /></button><button title="Dar de baja" className="danger-action" onClick={() => remove(employee)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
        </section>
      </main>
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><div className="modal"><div className="modal-header"><div><p className="eyebrow">{editingId ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</p><h2>{editingId ? 'Editar empleado' : 'Registrar empleado'}</h2></div><button className="close-button" onClick={() => setModalOpen(false)}><X size={20} /></button></div><form onSubmit={submit}><div className="form-grid"><label>Nombre *<input name="nombre" value={form.nombre} onChange={updateField} required /></label><label>Apellido *<input name="apellido" value={form.apellido} onChange={updateField} required /></label><label>Correo electrónico *<input type="email" name="correo" value={form.correo} onChange={updateField} required /></label><label>Teléfono<input name="telefono" value={form.telefono} onChange={updateField} /></label><label>Documento<input name="documento" value={form.documento} onChange={updateField} /></label><label>Cargo<input name="cargo" value={form.cargo} onChange={updateField} /></label><label>Área de trabajo *<select name="areaId" value={form.areaId} onChange={updateField} required><option value="">Selecciona un área</option>{areas.map((area) => <option key={area.AreaId} value={area.AreaId}>{area.Nombre}</option>)}</select></label><label>Fecha de ingreso *<input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={updateField} required /></label><label>Fecha de nacimiento<input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={updateField} /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Registrar empleado'}</button></div></form></div></div>}
    </div>
  );
}

export default App;
