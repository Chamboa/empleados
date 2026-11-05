import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import empleadosRoutes from './routes/empleados.routes.js';
import areasRoutes from './routes/areas.routes.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/empleados', empleadosRoutes);
app.use('/api/areas', areasRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.number === 2627 || error.number === 2601) {
    return res.status(409).json({ message: 'Ya existe un empleado con ese correo.' });
  }
  return res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(port, () => {
  console.log(`API de empleados disponible en http://localhost:${port}`);
});
