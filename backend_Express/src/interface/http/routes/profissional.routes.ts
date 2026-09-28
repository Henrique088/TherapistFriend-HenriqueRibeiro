// // src/interface/http/routes/profissional.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import {makeProfissionalController} from '../../../main/factories/profissional.factory'; 
import autenticarJWT from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { buscarProfissionaisSchema  } from '../../../application/validators/profissional.validator'; 

const profissionalRouter = Router();

const controller = makeProfissionalController();


// completar perfil do profissional
profissionalRouter.put('/completar-perfil', autenticarJWT, (req: Request, res: Response, next: NextFunction) => controller.completarPerfil(req, res, next));

// buscar profissionais com filtros e paginação
profissionalRouter.get('/buscar', autenticarJWT, validate(buscarProfissionaisSchema, 'query'),(req: Request, res: Response, next: NextFunction) => controller.buscar(req, res, next));

// Obter perfil público
profissionalRouter.get('/perfil-publico/:id', (req: Request, res: Response, next: NextFunction) => controller.perfilPublico(req, res, next));

export default profissionalRouter;