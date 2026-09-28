// src/interface/http/middlewares/authorize.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../../../application/errors/AppError';

export const authorize = (tiposPermitidos: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const usuario = req.usuario;

        if (!usuario) {
            return next(new AppError('Usuário não autenticado.', 401));
        }

        if (!tiposPermitidos.includes(usuario.tipo)) {
            return next(new AppError('Acesso negado: Você não tem permissão para esta ação.', 403));
        }

        next();
    };
};