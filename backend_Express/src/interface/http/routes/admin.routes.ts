import { Router } from 'express';
import auth from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { MakeAdminController } from '../../../main/factories/admin.factory';

const adminRoutes = Router();
const adminController = MakeAdminController();

adminRoutes.use(auth);

// Rota para validar ou revogar um profissional
adminRoutes.post('/validar', authorize(['admin']), (req, res, next) => adminController.validar(req,res, next));


// Rota para listar profissionais para admim com filtros de busca e status
adminRoutes.get('/profissionais', authorize(['admin']), (req, res, next) => adminController.listarProfissionaisParaAdmin(req,res, next));

// Rota para gerar dados do dashboard
adminRoutes.get('/dashboard', authorize(['admin']), (req, res, next) => adminController.gerarDashboard(req,res, next));

// Rota para listar usuários para admim com filtros de busca
adminRoutes.get('/usuarios', authorize(['admin']), (req, res, next) => adminController.listarUsuariosParaAdmin(req,res, next));

// Rota para listar pacientes para admim com filtros de busca e status
adminRoutes.get('/pacientes', authorize(['admin']), (req, res, next) => adminController.listarPacientesParaAdmin(req,res, next));

// Rota para listar historico validação
adminRoutes.get('/historico/:profissionalId', (req, res, next) => adminController.listarHistorico(req, res, next));


export default adminRoutes

