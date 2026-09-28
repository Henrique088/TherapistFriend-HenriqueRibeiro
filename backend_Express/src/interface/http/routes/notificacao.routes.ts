// src/interface/http/routes/notificacao.routes.ts

import { Router } from 'express';
import {makeNotificacaoController} from '../../../main/factories/notificacao.factory';
import auth from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validation';
import { NotificacaoValidator } from '../../../application/validators/notificacao.validator';


const notificacaoRouter = Router();

const controller = makeNotificacaoController();

// Protege todas as rotas de notificações
notificacaoRouter.use(auth);

// Rota para listar notificações do usuário
notificacaoRouter.get('/', authorize(['paciente', 'profissional', 'admin']), validate(NotificacaoValidator.listar, 'query'), (req, res, next) => controller.listarNotificacoes(req, res, next));

// Rota para marcar notificação como lida
notificacaoRouter.patch('/:notificacaoId/marcar-como-lida', authorize(['paciente', 'profissional']), validate(NotificacaoValidator.marcarComoLida, 'params'),(req, res, next) => controller.marcarComoLida(req, res, next));

// Rota para contar notificações não lidas
notificacaoRouter.get('/contar-nao-lidas', authorize(['paciente', 'profissional', 'admin']), (req, res, next) => controller.totalNaoLidas(req, res, next));

export default notificacaoRouter;