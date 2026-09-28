// src/interface/http/middlewares/auth.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../../../application/errors/AppError";

// Tipando a função middleware
export function autenticarJWT(req: Request, res: Response, next: NextFunction) {
    try {
        
        const token = req.cookies.accessToken as string | undefined;

        if (!token) {
            return next(new AppError("Token de acesso não fornecido", 401));
        }

        // Verifica o token e tipa o resultado como JwtPayload (do pacote 'jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret") as JwtPayload;

        // Verifica o tipo de usuário (e garante que 'decoded' possui o campo)
        const tipoUsuarioDecoded = decoded.tipo_usuario as string | undefined;

        if (!tipoUsuarioDecoded) {
            return next(new AppError("Token malformado: tipo de usuário ausente", 403));
        }

        const tiposPermitidos: string[] = ['paciente', 'profissional', 'admin'];
        if (!tiposPermitidos.includes(tipoUsuarioDecoded)) {
            return next(new AppError("Tipo de usuário inválido", 403));
        }

        // Injeta usuário na requisição (agora tipada via express.d.ts)
        req.usuario = {
            
            id: decoded.id as number, 
            tipo: tipoUsuarioDecoded as 'paciente' | 'profissional' | 'admin',
        };

        return next();
    } catch (err) {

        // Garantindo que 'err' é tratado como um objeto Error
        const error = err as Error;

        // Tratamento de Erros
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Token expirado", 401));
        }

        // Erro geral de JWT (ex: Token inválido, assinatura incorreta)
        return next(new AppError("Token inválido", 401));
    }
}

export default autenticarJWT;