// src/interface/http/routes/especialidade.routes.ts

import { Router } from 'express';
import {makeEspecialidadeController} from '../../../main/factories/especialidade.factory';

const especialidadeRouter = Router();
const controller = makeEspecialidadeController();

especialidadeRouter.get("/", (req, res, next) => controller.listar(req, res, next));


export default especialidadeRouter
