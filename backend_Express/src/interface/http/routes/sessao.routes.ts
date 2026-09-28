// src/infrastructure/http/routes/sessao.routes.ts

import { Router } from 'express';
import { makeSessaoController } from '../../../main/factories/sessao.factory';
import  auth  from '../middlewares/auth'; 
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validation';
import { SessaoValidator } from '../../../application/validators/sessao.validator';


const sessaoRoutes = Router();

const controller = makeSessaoController();

sessaoRoutes.use(auth);

sessaoRoutes.patch('/:id/encerrar', authorize(['profissional']), (req, res, next) => controller.encerrar(req, res, next));

sessaoRoutes.get('/:id/acesso', (req, res, next) => controller.obterAcesso(req, res, next));

sessaoRoutes.get('/:id/obter-relatorio', authorize(['profissional']), validate(SessaoValidator.sessaoId, 'params'),(req, res, next) => controller.obterRelatorio(req, res, next));

sessaoRoutes.get('/relatorios', authorize(['profissional']), (req, res, next)=> controller.relatorios(req, res, next));

sessaoRoutes.patch('/relatorios/:id/comentar', authorize(['profissional']), (req, res, next)=> controller.comentario(req, res, next));

sessaoRoutes.post('/:sessaoId/avaliar', authorize(['paciente']), (req, res, next)=> controller.avaliarSessao(req, res, next));



export default sessaoRoutes ;