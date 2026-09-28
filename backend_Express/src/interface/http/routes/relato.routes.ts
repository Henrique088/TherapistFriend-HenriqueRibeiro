// src/interface/http/routes/relato.routes.ts

import { Router } from 'express';
import  {makeRelatoController}  from '../../../main/factories/relato.factory';
import { makeLikeController } from '../../../main/factories/like.factory';
import  auth  from '../middlewares/auth'; 
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validation';
import {RelatoValidator} from '../../../application/validators/relatos.validator';

const relatoRouter = Router();

const controllerRelato = makeRelatoController();
const controllerLike = makeLikeController();

// Protege todas as rotas de relatos
relatoRouter.use(auth);

// Rota para o Paciente criar relato
relatoRouter.post('/', authorize(['paciente']), validate(RelatoValidator.criar), (req, res, next) => controllerRelato.criar(req, res, next));

// Rota para o Profissional listar relatos disponíveis
relatoRouter.get('/disponiveis', authorize(['profissional']), validate(RelatoValidator.listar, 'query'), (req, res, next) => controllerRelato.listarDisponiveis(req, res, next));

// Rota para o Profissional "Assumir" um relato (Candidatar-se)
relatoRouter.patch('/:relatoId/assumir',authorize(['profissional']), validate(RelatoValidator.assumir, 'params'),   (req, res, next) => controllerRelato.assumir(req, res, next));

// Rota para o Profissional recusar/desistir de um relato
relatoRouter.patch('/:id/recusar', authorize(['profissional']), validate(RelatoValidator.recusar), (req, res, next) => controllerRelato.recusar(req, res, next));

// Rota para o Paciente ACEITAR ou RECUSAR o profissional
relatoRouter.patch('/:id/decidir-vinculo',authorize(['paciente']), validate(RelatoValidator.decidirVinculo), (req, res, next) => controllerRelato.decidirVinculo(req, res, next));

// Rota para dar like e deslike
relatoRouter.post('/:relatoId/like', validate(RelatoValidator.validarRelatoId, 'params'), (req, res, next) => controllerLike.handle(req, res, next));

// Rota para paciente ver relatos
relatoRouter.get('/pacientes', authorize(['paciente']), validate(RelatoValidator.listar, 'query'), (req, res, next) => controllerRelato.listarParaPaciente(req, res, next));

// Rota para paciente deletar relato
relatoRouter.delete('/:relatoId', authorize(['paciente']), validate(RelatoValidator.validarRelatoId, 'params'), (req, res, next) => controllerRelato.deletarRelato(req, res, next));

// Rota para paciente atualizar relato
relatoRouter.put('/:relatoId', authorize(['paciente']), validate(RelatoValidator.criar), validate(RelatoValidator.validarRelatoId, 'params'), (req, res, next) => controllerRelato.atualizarRelato(req, res, next));

export default relatoRouter ;