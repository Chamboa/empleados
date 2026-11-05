# empleados
Proyecto de gestión de empleados

## Base de datos MySQL en XAMPP

El script para MySQL/XAMPP se encuentra en
[`database/01_empleados.sql`](database/01_empleados.sql). Crea lo que es `EmpleadosDB`,
la base `empleados_db`, las tablas `areas` y `empleados`, datos iniciales de áreas y una vista para
consultar los empleados con su área.

En XAMPP inicia **MySQL** y **Apache**, abre phpMyAdmin, selecciona la pestaña
**SQL** y ejecuta el script. La eliminación es una baja lógica: el empleado
queda inactivo y no se borra físicamente, cambia su valor de 1 a 0.

## Aplicación web

El proyecto está dividido en:

- backend: API REST con Node.js, Express y `mysql2`.
- frontend: interfaz React con Vite.

### Ejecutar el backend

```bash
cd backend
cp .env.example .env
# Para XAMPP normalmente root no tiene contraseña
# Ajusta DB_PASSWORD si configuraste una
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
