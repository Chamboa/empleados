import { getPool, sql } from '../config/database.js';

export async function listarEmpleados(incluirInactivos = false) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('IncluirInactivos', sql.Bit, incluirInactivos)
    .execute('dbo.usp_Empleado_Listar');
  return result.recordset;
}

export async function obtenerEmpleado(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('EmpleadoId', sql.Int, id)
    .execute('dbo.usp_Empleado_Obtener');
  return result.recordset[0] || null;
}

export async function crearEmpleado(data) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Nombre', sql.NVarChar(100), data.nombre)
    .input('Apellido', sql.NVarChar(100), data.apellido)
    .input('Correo', sql.NVarChar(254), data.correo)
    .input('Telefono', sql.NVarChar(30), data.telefono || null)
    .input('Documento', sql.NVarChar(50), data.documento || null)
    .input('FechaNacimiento', sql.Date, data.fechaNacimiento || null)
    .input('FechaIngreso', sql.Date, data.fechaIngreso || null)
    .input('Cargo', sql.NVarChar(100), data.cargo || null)
    .input('AreaId', sql.Int, data.areaId)
    .execute('dbo.usp_Empleado_Crear');
  return result.recordset[0];
}

export async function actualizarEmpleado(id, data) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('EmpleadoId', sql.Int, id)
    .input('Nombre', sql.NVarChar(100), data.nombre)
    .input('Apellido', sql.NVarChar(100), data.apellido)
    .input('Correo', sql.NVarChar(254), data.correo)
    .input('Telefono', sql.NVarChar(30), data.telefono || null)
    .input('Documento', sql.NVarChar(50), data.documento || null)
    .input('FechaNacimiento', sql.Date, data.fechaNacimiento || null)
    .input('FechaIngreso', sql.Date, data.fechaIngreso)
    .input('Cargo', sql.NVarChar(100), data.cargo || null)
    .input('AreaId', sql.Int, data.areaId)
    .input('Activo', sql.Bit, data.activo ?? true)
    .execute('dbo.usp_Empleado_Actualizar');
  return result.recordset[0] || null;
}

export async function eliminarEmpleado(id) {
  const pool = await getPool();
  await pool
    .request()
    .input('EmpleadoId', sql.Int, id)
    .execute('dbo.usp_Empleado_Eliminar');
}

export async function listarAreas() {
  const pool = await getPool();
  const result = await pool.execute('dbo.usp_Area_Listar');
  return result.recordset;
}
