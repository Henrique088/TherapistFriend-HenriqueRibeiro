// src/interface/http/routes/auth.routes.ts

import { Router } from "express";
import { validate } from '../middlewares/validation';
import { loginSchema } from "../../../application/validators/auth.validator";
import {makeAuthController} from '../../../main/factories/auth.factory';


const authrouter = Router();

// Tipagem para garantir que a Factory está correta
const controller = makeAuthController();

// Rota de Login (POST)
authrouter.post("/login", validate(loginSchema), (req, res, next) => controller.login(req, res, next));

// Rota de Renovação de Tokens (GET/POST - Geralmente POST para segurança)
// O controller lê o cookie 'refreshToken' e emite novos tokens
authrouter.post("/refresh", (req, res, next) => controller.refresh(req, res, next));

// Rota de Logout (POST)
// O controller revoga o refresh token no DB e limpa os cookies
authrouter.post("/logout", (req, res, next) => controller.logout(req, res, next));

export default authrouter;