import { Router } from 'express';
import {
  actualizarEmpleado,
  crearEmpleado,
  eliminarEmpleado,
  listarEmpleados,
  obtenerEmpleado,
} from '../services/empleados.service.js';

const router = Router();

const namePattern = /^[\p{L}][\p{L}\s'-]*$/u;
const phonePattern = /^[0-9+()\s-]+$/;
const documentPattern = /^[a-zA-Z0-9.-]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (!datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validarEmpleado(body, actualizar = false) {
  const errors = {};
  const required = ['nombre', 'apellido', 'correo', 'areaId'];
  if (actualizar) required.push('fechaIngreso');

  for (const field of required) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
      errors[field] = 'Este campo es obligatorio';
    }
  }

  for (const field of ['nombre', 'apellido']) {
    const value = String(body[field] || '').trim();
    if (value && (value.length < 2 || value.length > 100 || !namePattern.test(value))) {
      errors[field] = 'Usa entre 2 y 100 letras, espacios, guiones o apóstrofes';
    }
  }

  const email = String(body.correo || '').trim();
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) {
    errors.correo = 'Ingresa un correo electrónico válido';
  }

  for (const field of ['telefono', 'documento']) {
    const value = String(body[field] || '').trim();
    if (value && value.length > (field === 'telefono' ? 30 : 50)) {
      errors[field] = `No puede superar ${field === 'telefono' ? 30 : 50} caracteres`;
    } else if (value && field === 'telefono' && (!phonePattern.test(value) || value.replace(/\D/g, '').length < 7)) {
      errors[field] = 'Ingresa un teléfono válido';
    } else if (value && field === 'documento' && !documentPattern.test(value)) {
      errors[field] = 'Usa solo letras, números, puntos o guiones';
    }
  }

  const cargo = String(body.cargo || '').trim();
  if (cargo.length > 100) errors.cargo = 'No puede superar 100 caracteres';
  if (body.areaId !== undefined && (!Number.isInteger(Number(body.areaId)) || Number(body.areaId) < 1)) {
    errors.areaId = 'Selecciona un área válida';
  }

  for (const field of ['fechaNacimiento', 'fechaIngreso']) {
    if (body[field] && !isValidDate(body[field])) errors[field] = 'Usa una fecha válida (AAAA-MM-DD)';
  }
  if (body.fechaNacimiento && body.fechaIngreso && isValidDate(body.fechaNacimiento) &&
      isValidDate(body.fechaIngreso) && body.fechaNacimiento > body.fechaIngreso) {
    errors.fechaNacimiento = 'Debe ser anterior a la fecha de ingreso';
  }
  if (body.fechaIngreso && isValidDate(body.fechaIngreso) &&
      body.fechaIngreso > new Date().toISOString().slice(0, 10)) {
    errors.fechaIngreso = 'No puede ser una fecha futura';
  }

  return Object.keys(errors).length ? errors : null;
}

router.get('/', async (req, res, next) => {
  try {
    const empleados = await listarEmpleados(req.query.incluirInactivos === 'true');
    res.json(empleados);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
    return res.status(400).json({ message: 'El identificador no es válido' });
  }
  try {
    const empleado = await obtenerEmpleado(Number(req.params.id));
    if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
    return res.json(empleado);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  const validationError = validarEmpleado(req.body);
  if (validationError) return res.status(400).json({
    message: 'Revisa los campos del formulario',
    errors: validationError,
  });

  try {
    const empleado = await crearEmpleado(req.body);
    return res.status(201).json(empleado);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
    return res.status(400).json({ message: 'El identificador no es válido' });
  }
  const validationError = validarEmpleado(req.body, true);
  if (validationError) return res.status(400).json({
    message: 'Revisa los campos del formulario',
    errors: validationError,
  });

  try {
    const empleado = await actualizarEmpleado(Number(req.params.id), req.body);
    if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
    return res.json(empleado);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
    return res.status(400).json({ message: 'El identificador no es válido' });
  }
  try {
    const empleado = await obtenerEmpleado(Number(req.params.id));
    if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
    await eliminarEmpleado(Number(req.params.id));
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
