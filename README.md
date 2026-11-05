# empleados
Proyecto de gestión de empleados

## Base de datos

El script inicial para SQL Server se encuentra en
[`database/01_empleados.sql`](database/01_empleados.sql). Crea `EmpleadosDB`,
las tablas `Areas` y `Empleados`, datos iniciales de áreas y procedimientos
almacenados para listar, consultar, crear, actualizar y dar de baja empleados.

Ejecuta el script desde SQL Server Management Studio o `sqlcmd`. La eliminación
es una baja lógica: el empleado queda inactivo y no se borra físicamente.
