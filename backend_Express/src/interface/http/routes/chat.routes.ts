// src/interface/http/routes/chat.routes.ts

import { Router } from 'express';
import { makeMensagemController } from '../../../main/factories/mensagem.factory';
import { makeconversaController } from '../../../main/factories/conversa.factory';
import { autenticarJWT } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { MensagemValidator} from '../../../application/validators/mensagem.validator';

const chatRoutes = Router();
const controller = makeMensagemController();
const conversa = makeconversaController();

// Todas as rotas de chat exigem autenticação
chatRoutes.use(autenticarJWT);

// Enviar mensagem
chatRoutes.post('/conversas/:conversaId/mensagens', validate(MensagemValidator.enviar), validate(MensagemValidator.conversaIdParam, 'params'),(req, res, next) => controller.enviar(req, res, next));

// Listar histórico paginado
chatRoutes.get('/conversas/:conversaId/mensagens', validate(MensagemValidator.conversaIdParam, 'params'), (req, res, next) => controller.listarHistorico(req, res, next));

// Editar mensagem
chatRoutes.put('/mensagens/:mensagemId', validate(MensagemValidator.editar), validate(MensagemValidator.mensagemIdParam, 'params'), (req, res, next) => controller.editar(req, res, next));

// Deletar mensagem
chatRoutes.delete('/mensagens/:mensagemId',  validate(MensagemValidator.mensagemIdParam, 'params'), (req, res, next) => controller.deletar(req, res, next));

// Pegar total não lidas
chatRoutes.get('/conversas/nao-lidas', (req, res, next) => controller.totalNaoLidas(req, res, next));

// Pegar as conversas de um usuário
chatRoutes.get('/conversas',  (req, res, next) => conversa.listarConversas(req, res, next));

// Visualizar Mensagens (Marcar Como lida)
chatRoutes.put('/visualizar', (req, res, next) => controller.visualizar(req, res, next));

export default chatRoutes;