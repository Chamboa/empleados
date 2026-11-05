import { getPool } from '../config/database.js';

const employeeColumns = `
  e.EmpleadoId, e.Nombre, e.Apellido,
  CONCAT(e.Nombre, ' ', e.Apellido) AS NombreCompleto,
  e.Correo, e.Telefono, e.Documento, e.FechaNacimiento,
  e.FechaIngreso, e.Cargo, e.AreaId, a.Nombre AS AreaNombre,
  e.Activo, e.FechaCreacion, e.FechaActualizacion
`;

const employeeQuery = `
  SELECT ${employeeColumns}
  FROM empleados e
  INNER JOIN areas a ON a.AreaId = e.AreaId
`;

export async function listarEmpleados(incluirInactivos = false) {
  const [rows] = await getPool().query(
    `${employeeQuery} ${incluirInactivos ? '' : 'WHERE e.Activo = 1'} ORDER BY e.Apellido, e.Nombre`,
  );
  return rows;
}

export async function obtenerEmpleado(id) {
  const [rows] = await getPool().execute(`${employeeQuery} WHERE e.EmpleadoId = ?`, [id]);
  return rows[0] || null;
}

export async function crearEmpleado(data) {
  const [result] = await getPool().execute(
    `INSERT INTO empleados
      (Nombre, Apellido, Correo, Telefono, Documento, FechaNacimiento, FechaIngreso, Cargo, AreaId)
     VALUES (TRIM(?), TRIM(?), LOWER(TRIM(?)), NULLIF(TRIM(?), ''), NULLIF(TRIM(?), ''),
       NULLIF(?, ''), COALESCE(NULLIF(?, ''), CURRENT_DATE), NULLIF(TRIM(?), ''), ?)`,
    [
      data.nombre,
      data.apellido,
      data.correo,
      data.telefono || null,
      data.documento || null,
      data.fechaNacimiento || null,
      data.fechaIngreso || null,
      data.cargo || null,
      data.areaId,
    ],
  );
  return obtenerEmpleado(result.insertId);
}

export async function actualizarEmpleado(id, data) {
  const [result] = await getPool().execute(
    `UPDATE empleados
     SET Nombre = TRIM(?), Apellido = TRIM(?), Correo = LOWER(TRIM(?)),
       Telefono = NULLIF(TRIM(?), ''), Documento = NULLIF(TRIM(?), ''),
       FechaNacimiento = NULLIF(?, ''), FechaIngreso = ?, Cargo = NULLIF(TRIM(?), ''),
       AreaId = ?, Activo = ?
     WHERE EmpleadoId = ?`,
    [
      data.nombre,
      data.apellido,
      data.correo,
      data.telefono || null,
      data.documento || null,
      data.fechaNacimiento || null,
      data.fechaIngreso,
      data.cargo || null,
      data.areaId,
      data.activo ?? true,
      id,
    ],
  );
  return result.affectedRows ? obtenerEmpleado(id) : null;
}

export async function eliminarEmpleado(id) {
  const [result] = await getPool().execute(
    'UPDATE empleados SET Activo = 0 WHERE EmpleadoId = ?',
    [id],
  );
  return result.affectedRows > 0;
}

export async function listarAreas() {
  const [rows] = await getPool().query(
    'SELECT AreaId, Nombre, Descripcion, Activa FROM areas WHERE Activa = 1 ORDER BY Nombre',
  );
  return rows;
}
