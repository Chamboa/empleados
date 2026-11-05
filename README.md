# empleados
Proyecto de gestión de empleados

## Base de datos

El script inicial para SQL Server se encuentra en
[`database/01_empleados.sql`](database/01_empleados.sql). Crea `EmpleadosDB`,
las tablas `Areas` y `Empleados`, datos iniciales de áreas y procedimientos
almacenados para listar, consultar, crear, actualizar y dar de baja empleados.

Ejecuta el script desde SQL Server Management Studio o `sqlcmd`. La eliminación
es una baja lógica: el empleado queda inactivo y no se borra físicamente.

## Aplicación web

El proyecto está dividido en:

- `backend`: API REST con Node.js, Express y `mssql`.
- `frontend`: interfaz React con Vite.

### Ejecutar el backend

```bash
cd backend
cp .env.example .env
# Completa DB_SERVER, DB_NAME, DB_USER y DB_PASSWORD
npm install
npm run dev
```

La API queda disponible en `http://localhost:4000`. Sus endpoints principales
son `GET /api/empleados`, `POST /api/empleados`, `PUT /api/empleados/:id`,
`DELETE /api/empleados/:id` y `GET /api/areas`.

### Ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

La interfaz queda disponible en `http://localhost:5173`. Si la API usa otra
dirección, crea `frontend/.env` con
`VITE_API_URL=http://localhost:4000/api`.
