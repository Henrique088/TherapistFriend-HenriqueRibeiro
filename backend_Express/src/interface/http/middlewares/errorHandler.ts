// src/interface/http/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express'; 
import AppError from "../../../application/errors/AppError";

// Middleware de Erro Global: Necessita dos 4 argumentos (err, req, res, next) e a tipagem correta.
export default (err: any, req: Request, res: Response, next: NextFunction): Response => {
    
    // Log detalhado do erro para o console do servidor
    console.error(" ERRO GLOBAL:", err); 

    // Lida com AppError (Erros de Domínio/Aplicação)
    // Se o erro for uma instância de AppError, usa o status HTTP anexado.
    if (err instanceof AppError) {
    
        
        const statusCode = err.statusCode || 400; 

        return res.status(statusCode).json({
            sucesso: false,
            errors: err.errors
        });
    }

    // Lidar com Outros Erros (Erros de Servidor, DB não capturados, etc.)
    // Se o erro não for um AppError, é um erro inesperado (500 Internal Server Error).
    return res.status(500).json({
        sucesso: false,
        erro: "Erro interno no servidor"
    });
};