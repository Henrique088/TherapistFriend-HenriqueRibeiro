// src/main/routes/agenda.routes.ts

import { Router } from 'express';
import { makeAgendaController } from '../../../main/factories/agenda.factory';
import auth from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { AgendaValidator } from '../../../application/validators/agenda.validator';
import { authorize } from '../middlewares/authorize';

const agendaroutes = Router();
const controller = makeAgendaController();


agendaroutes.use(auth);


// --- Profissional: Configuração de Grade ---
agendaroutes.put('/profissional/:profissionalId/grade', authorize(['profissional']), validate(AgendaValidator.salvarGrade, 'body'),validate(AgendaValidator.paramsProfissionaId, 'params'),  (req, res, next) => controller.salvarGrade(req, res, next));

// --- Calendário: Visualização de Eventos (Mês/Semana/Dia) ---
agendaroutes.get('/profissional/:profissionalId/eventos', authorize(['profissional']), validate(AgendaValidator.paramsProfissionaId, 'params'), (req, res, next) => controller.listarEventos(req, res, next));

// --- Paciente: Busca de Horários Disponíveis (Slots) ---
agendaroutes.get('/profissional/:profissionalId/livres', authorize(['paciente']), validate(AgendaValidator.paramsProfissionaId, 'params'), (req, res, next) => controller.listarDisponibilidade(req, res, next));

// --- Operações de Agendamento ---
agendaroutes.post('/agendar', authorize(['paciente']), validate(AgendaValidator.agendar), (req, res, next) => controller.agendar(req, res, next));

agendaroutes.patch('/agendamento/:id/responder', authorize(['profissional']), validate(AgendaValidator.responder), validate(AgendaValidator.paramsId, 'params'),(req, res, next) => controller.responder(req, res, next));

agendaroutes.patch('/agendamento/:id/cancelar-paciente', authorize(['paciente']), validate(AgendaValidator.paramsId, 'params'),(req, res, next) => controller.cancelar(req, res, next));

// --- Operações de Urgências ---
agendaroutes.post('/solicitar-urgencia/:profissionalId', validate(AgendaValidator.paramsProfissionaId, 'params'), validate(AgendaValidator.solicitarUrgencia),authorize(['paciente']), (req, res, next) => controller.solicitarUrgencia(req,res, next));

agendaroutes.get('/listar-urgencias/:profissionalId', authorize(['profissional']), validate(AgendaValidator.paramsProfissionaId, 'params'), (req, res, next) => controller.listarUrgencias(req, res, next))

agendaroutes.patch('/aprovar-urgencia/:profissionalId',authorize(['profissional']), (res, req, next) => controller.aprovarUrgencia(res,req, next));

// --- Dashboard ---
agendaroutes.get('/dashboard/:profissionalId', authorize(['profissional']),validate(AgendaValidator.paramsProfissionaId, 'params'), (req, res, next) => controller.gerarDashboardProfissional(req, res, next));
export default agendaroutes;