# EMPLEADOS

Proyecto sencillo para registrar empleados.

## QUE SE NECESITA

- XAMPP
- MySQL funcionando
- Node.js instalado
- npm
- Git (opcional)

## CARPETAS

```text
database/   archivo de la base de datos
backend/    servidor Node.js
frontend/   pagina React
```

## 1. PREPARAR LA BASE DE DATOS

1. Abrir XAMPP.
2. Iniciar **MySQL**. Apache no es obligatorio para la aplicación, pero se
   puede iniciar si se va a usar phpMyAdmin.
3. Abrir `http://localhost/phpmyadmin`.
4. Entrar a la pestaña **SQL**.
5. Copiar y ejecutar el contenido de:

```text
database/01_empleados.sql
```

El script crea la base `empleados_db`, las tablas de áreas y empleados y
algunas áreas iniciales.

## 2. CONFIGURAR Y EJECUTAR EL BACKEND

Abrir una terminal en la carpeta del proyecto:

```bash
cd backend
```

Copiar el archivo de configuración:

En Windows:

```bash
copy .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

El archivo `.env` debe quedar parecido a esto:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=empleados_db
DB_USER=root
DB_PASSWORD=
```

Si el usuario `root` tiene contraseña en XAMPP, escribirla en
`DB_PASSWORD`.

Instalar las dependencias y arrancar:

```bash
npm install
npm run dev
```

El backend funciona en:

```text
http://localhost:4000
```

Para comprobarlo, abrir:

```text
http://localhost:4000/api/health
```

Debe aparecer:

```json
{"status":"ok"}
```

## 3. EJECUTAR EL FRONTEND

Abrir otra terminal. No cerrar la terminal donde está corriendo el backend.

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador la dirección que muestra Vite, normalmente:

```text
http://localhost:5173
```

Si el backend está en otra dirección, crear `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

## FUNCIONES

- Ver empleados.
- Buscar empleados.
- Registrar empleados.
- Editar empleados.
- Dar de baja empleados.
- Ver las áreas de trabajo.
- Validar datos antes de guardar.

La opción de eliminar no borra el registro de MySQL. Solo cambia el empleado
a inactivo.

## RUTAS PRINCIPALES DEL BACKEND

```text
GET    /api/health
GET    /api/empleados
GET    /api/empleados/:id
POST   /api/empleados
PUT    /api/empleados/:id
DELETE /api/empleados/:id
GET    /api/areas
```

## SI NO FUNCIONA

### Error de conexión a MySQL

- Revisar que MySQL esté iniciado en XAMPP.
- Revisar los datos del archivo `backend/.env`.
- Revisar que el puerto sea `3306`.
- Revisar que exista la base `empleados_db`.

### El frontend no muestra datos

- Revisar que el backend esté ejecutándose.
- Abrir `http://localhost:4000/api/health`.
- Revisar que `VITE_API_URL` termine en `/api`.

### Error de dependencias

Ejecutar otra vez dentro de la carpeta correspondiente:

```bash
npm install
```

## COMANDOS RESUMIDOS

Terminal 1:

```bash
cd backend
npm install
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```
