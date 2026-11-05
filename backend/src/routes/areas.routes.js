import { Router } from 'express';
import { listarAreas } from '../services/empleados.service.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json(await listarAreas());
  } catch (error) {
    next(error);
  }
});

export default router;
