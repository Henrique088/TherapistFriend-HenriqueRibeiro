// src/interface/http/routes/usuario.routes.ts

import { Router } from "express";

import {makeUsuarioController} from '../../../main/factories/usuario.factory';
import { UsuarioController } from "../../controllers/UsuarioController";
import { UsuarioValidator } from "../../../application/validators/usuario.validator";
import { validate } from "../middlewares/validation";
import auth from '../middlewares/auth';


const controller = makeUsuarioController();

const usuarioRouter = Router();

// Rota de Registro (POST)
usuarioRouter.post("/registrar", validate(UsuarioValidator.criar), (req, res, next) => controller.registrar(req, res, next));

// Rota de Busca por ID (GET)
usuarioRouter.get("/:id", validate(UsuarioValidator.buscarPorId, 'params'), (req, res, next) => controller.buscarPorId(req, res, next));

// Rota de Atualização (PUT)
usuarioRouter.put("/:id", validate(UsuarioValidator.atualizar), validate(UsuarioValidator.validadeIdParams, 'params'), (req, res, next) => controller.atualizar(req, res, next));

// Rota de Desativação Lógica (DELETE/PATCH, mas usando DELETE aqui)
usuarioRouter.delete("/:id", validate(UsuarioValidator.validadeIdParams, 'params'), (req, res, next) => controller.desativar(req, res, next));

// Rota de Busca por Email (GET)
usuarioRouter.get("/email/:email", validate(UsuarioValidator.buscarPorEmail, 'params'), (req, res, next) => controller.buscarPorEmail(req, res, next));

// Rota para obter o perfil do usuário autenticado
usuarioRouter.get("/perfil/me", auth, (req, res, next) => controller.me(req, res, next));

// Rota para enviar código de verificação por email
usuarioRouter.post("/:email/enviar-codigo/email", validate(UsuarioValidator.buscarPorEmail, 'params'), (req, res, next) => controller.enviarCodigoEmail(req, res, next));

// Rota para enviar código de verificação por SMS
usuarioRouter.post("/:email/enviar-codigo/sms", validate(UsuarioValidator.buscarPorEmail, 'params'), (req, res, next) => controller.enviarCodigoSms(req, res, next));

// Rota para validar código de verificação por email
usuarioRouter.post("/:email/validar-codigo/email", validate(UsuarioValidator.buscarPorEmail, 'params'), validate(UsuarioValidator.validarCodigo, 'body'), (req, res, next) => controller.validarCodigoEmail(req, res, next));

// Rota para validar código de verificação por SMS
usuarioRouter.post("/:email/validar-codigo/sms", validate(UsuarioValidator.buscarPorEmail, 'params'), validate(UsuarioValidator.validarCodigo, 'body'), (req, res, next) => controller.validarCodigoSms(req, res, next));


export default usuarioRouter;