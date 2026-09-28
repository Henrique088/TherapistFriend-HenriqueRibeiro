// src/interface/http/routes/bloqueio.routes.ts

import { Router } from 'express';
import {makeBloqueioController} from '../../../main/factories/bloqueio.factory'
import auth from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validation';
import { AgendaValidator } from '../../../application/validators/agenda.validator';

const bloqueioRouter = Router();
const controller = makeBloqueioController();


bloqueioRouter.use(auth);

/**
 * @route POST /bloqueios
 * @desc Cria um novo bloqueio de agenda (pontual ou recorrente)
 */
bloqueioRouter.post('/', authorize(['profissional']), validate(AgendaValidator.salvarBloqueio), (req, res, next) => controller.criar(req, res, next));

/**
 * @route POST /bloqueios/excecao
 * @desc Adiciona uma exceção ("furo") a um bloqueio existente em uma data específica
 */
bloqueioRouter.post('/excecao', authorize(['profissional']), validate(AgendaValidator.salvarExcecao),(req, res, next) => controller.adicionarExcecao(req, res, next));


/** * @route DELETE /bloqueio/:profissionalId/:bloqueioId
 * @desc Remove um bloqueio específico de um profissional
 */
bloqueioRouter.delete('/deletar/:profissionalId/:bloqueioId',validate(AgendaValidator.removerBloqueio, 'params'), authorize(['profissional']), (req, res, next) => controller.remover(req, res, next));

/**
 * @route DELETE /bloqueio/excecao/:excecaoId
 * @desc Remove uma exceção específica de um bloqueio
 */
bloqueioRouter.delete('/excecao/:excecaoId',validate(AgendaValidator.removerExcecao, 'query'),validate(AgendaValidator.removerExcecaoParams, 'params'), authorize(['profissional']), (req, res, next) => controller.removerExcecao(req, res, next));
export default bloqueioRouter;