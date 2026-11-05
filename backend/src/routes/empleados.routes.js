import { Router } from 'express';
import {
  actualizarEmpleado,
  crearEmpleado,
  eliminarEmpleado,
  listarEmpleados,
  obtenerEmpleado,
} from '../services/empleados.service.js';

const router = Router();

function validarEmpleado(body, actualizar = false) {
  const required = ['nombre', 'apellido', 'correo', 'areaId'];
  if (actualizar) required.push('fechaIngreso');
  const missing = required.filter((field) => body[field] === undefined || body[field] === '');
  if (missing.length) {
    return `Faltan campos obligatorios: ${missing.join(', ')}`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.correo)) {
    return 'El correo electrónico no es válido';
  }
  if (!Number.isInteger(Number(body.areaId))) {
    return 'El área seleccionada no es válida';
  }
  return null;
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
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const empleado = await crearEmpleado(req.body);
    return res.status(201).json(empleado);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const validationError = validarEmpleado(req.body, true);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const empleado = await actualizarEmpleado(Number(req.params.id), req.body);
    if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
    return res.json(empleado);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
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
