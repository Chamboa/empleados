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

const namePattern = /^[\p{L}][\p{L}\s'-]*$/u;
const phonePattern = /^[0-9+()\s-]+$/;

function validateForm(values) {
  const errors = {};
  const required = ['nombre', 'apellido', 'correo', 'areaId', 'fechaIngreso'];
  required.forEach((field) => {
    if (!String(values[field] ?? '').trim()) errors[field] = 'Este campo es obligatorio';
  });
  ['nombre', 'apellido'].forEach((field) => {
    const value = values[field].trim();
    if (value && (value.length < 2 || value.length > 100 || !namePattern.test(value))) {
      errors[field] = 'Usa entre 2 y 100 letras';
    }
  });
  if (values.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.correo)) {
    errors.correo = 'Ingresa un correo válido';
  }
  if (values.telefono && (!phonePattern.test(values.telefono) || values.telefono.replace(/\D/g, '').length < 7)) {
    errors.telefono = 'Ingresa un teléfono válido';
  }
  if (values.documento && !/^[a-zA-Z0-9.-]+$/.test(values.documento)) {
    errors.documento = 'Usa solo letras, números, puntos o guiones';
  }
  if (values.cargo.length > 100) errors.cargo = 'No puede superar 100 caracteres';
  if (values.fechaNacimiento && values.fechaIngreso && values.fechaNacimiento > values.fechaIngreso) {
    errors.fechaNacimiento = 'Debe ser anterior al ingreso';
  }
  if (values.fechaIngreso && values.fechaIngreso > new Date().toISOString().slice(0, 10)) {
    errors.fechaIngreso = 'No puede ser futura';
  }
  return errors;
}

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [section, setSection] = useState('empleados');

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
    setFieldErrors({});
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
    setFieldErrors({});
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError('Revisa los campos marcados antes de guardar.');
      return;
    }
    setSaving(true);
    setFieldErrors({});
    try {
      if (editingId) await api.updateEmpleado(editingId, form);
      else await api.createEmpleado(form);
      setModalOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
      setFieldErrors(saveError.errors || {});
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
        <button className={`nav-item ${section === 'empleados' ? 'active' : ''}`} onClick={() => setSection('empleados')}><Users size={18} /> Empleados</button>
        <button className={`nav-item ${section === 'areas' ? 'active' : ''}`} onClick={() => setSection('areas')}><BriefcaseBusiness size={18} /> Áreas de trabajo</button>
      </aside>
      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">GESTIÓN</p><h1>{section === 'empleados' ? 'Empleados' : 'Áreas de trabajo'}</h1></div>{section === 'empleados' && <button className="primary-button" onClick={openCreate}><Plus size={18} /> Nuevo empleado</button>}</header>
        {section === 'areas' ? <section className="table-card areas-page">
          <div className="table-header"><div><h2>Áreas de trabajo</h2><p>Áreas disponibles para asignar a los empleados.</p></div></div>
          {areas.length === 0 ? <div className="empty-state">No hay áreas registradas.</div> : <div className="area-list">{areas.map((area) => <div className="area-row" key={area.AreaId}><div className="area-symbol"><BriefcaseBusiness size={18} /></div><div><strong>{area.Nombre}</strong><small>{area.Descripcion || 'Sin descripción'}</small></div><span className="status"><i />Activa</span></div>)}</div>}
        </section> : <>
        <section className="stats">
          <div className="stat-card"><div className="stat-icon blue"><Users size={20} /></div><div><span>Total empleados</span><strong>{empleados.length}</strong></div></div>
          <div className="stat-card"><div className="stat-icon green"><BriefcaseBusiness size={20} /></div><div><span>Áreas activas</span><strong>{areas.length}</strong></div></div>
          <div className="stat-card"><div className="stat-icon orange"><Mail size={20} /></div><div><span>Resultados</span><strong>{filteredEmployees.length}</strong></div></div>
        </section>
        </>}
        <section className="table-card">
          <div className="table-header"><div><h2>Directorio de empleados</h2><p>Consulta y administra el personal registrado.</p></div><label className="search-box"><Search size={18} /><input placeholder="Buscar por nombre, correo o área..." value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
          {error && <div className="alert">{error}</div>}
          {loading ? <div className="empty-state">Cargando empleados...</div> : filteredEmployees.length === 0 ? <div className="empty-state">No hay empleados que coincidan con la búsqueda.</div> : <div className="table-wrap"><table><thead><tr><th>EMPLEADO</th><th>CONTACTO</th><th>ÁREA</th><th>CARGO</th><th>ESTADO</th><th></th></tr></thead><tbody>{filteredEmployees.map((employee) => <tr key={employee.EmpleadoId}><td><div className="employee-cell"><div className="avatar">{employee.Nombre[0]}{employee.Apellido[0]}</div><div><strong>{employee.NombreCompleto}</strong><small>Ingreso: {employee.FechaIngreso?.slice(0, 10)}</small></div></div></td><td><span className="email">{employee.Correo}</span><small>{employee.Telefono || 'Sin teléfono'}</small></td><td><span className="area-pill">{employee.AreaNombre}</span></td><td>{employee.Cargo || 'Sin cargo'}</td><td><span className="status"><i />Activo</span></td><td><div className="actions"><button title="Editar" onClick={() => openEdit(employee)}><Pencil size={16} /></button><button title="Dar de baja" className="danger-action" onClick={() => remove(employee)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
        </section>
      </main>
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><div className="modal"><div className="modal-header"><div><p className="eyebrow">{editingId ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</p><h2>{editingId ? 'Editar empleado' : 'Registrar empleado'}</h2></div><button className="close-button" onClick={() => setModalOpen(false)}><X size={20} /></button></div><form onSubmit={submit} noValidate><div className="form-grid">
        {[
          ['nombre', 'Nombre *'], ['apellido', 'Apellido *'], ['correo', 'Correo electrónico *'],
          ['telefono', 'Teléfono'], ['documento', 'Documento'], ['cargo', 'Cargo'],
        ].map(([name, label]) => <label key={name}>{label}<input type={name === 'correo' ? 'email' : 'text'} name={name} value={form[name]} onChange={updateField} maxLength={name === 'correo' ? 254 : name === 'telefono' ? 30 : name === 'documento' ? 50 : 100} aria-invalid={Boolean(fieldErrors[name])} />{fieldErrors[name] && <small className="field-error">{fieldErrors[name]}</small>}</label>)}
        <label>Área de trabajo *<select name="areaId" value={form.areaId} onChange={updateField} aria-invalid={Boolean(fieldErrors.areaId)}><option value="">Selecciona un área</option>{areas.map((area) => <option key={area.AreaId} value={area.AreaId}>{area.Nombre}</option>)}</select>{fieldErrors.areaId && <small className="field-error">{fieldErrors.areaId}</small>}</label>
        <label>Fecha de ingreso *<input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={updateField} max={new Date().toISOString().slice(0, 10)} aria-invalid={Boolean(fieldErrors.fechaIngreso)} />{fieldErrors.fechaIngreso && <small className="field-error">{fieldErrors.fechaIngreso}</small>}</label>
        <label>Fecha de nacimiento<input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={updateField} max={form.fechaIngreso || new Date().toISOString().slice(0, 10)} aria-invalid={Boolean(fieldErrors.fechaNacimiento)} />{fieldErrors.fechaNacimiento && <small className="field-error">{fieldErrors.fechaNacimiento}</small>}</label>
      </div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Registrar empleado'}</button></div></form></div></div>}
    </div>
  );
}

export default App;
