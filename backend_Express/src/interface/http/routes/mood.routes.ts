// src/interface/http/routes/mood.routes.ts

import {Router} from 'express';
import { makeRegistrarMoodUseCase } from '../../../main/factories/mood.factory';
import auth from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const moodRouter = Router();
const registrarMoodUseCase = makeRegistrarMoodUseCase();

moodRouter.post('/registrar', auth, authorize(['paciente']),(req, res, next) => registrarMoodUseCase.registrar(req, res, next));

moodRouter.get('/cards', auth, authorize(['paciente']), (req, res, next) => registrarMoodUseCase.gerarCards(req, res, next));

export default moodRouter;

