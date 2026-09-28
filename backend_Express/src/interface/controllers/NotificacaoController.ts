// src/interface/controllers/NotificacaoController.ts

import { Request, Response, NextFunction } from 'express';
import { ContarNotificacoesNaoLidasUseCase } from '../../application/use-cases/notificacao/ContarNotificacoesNaoLidasUseCase';
import { ListarNotificacoesUseCase } from '../../application/use-cases/notificacao/ListarNotificacoesUseCase';
import { MarcarNotificacaoComoLidaUseCase } from '../../application/use-cases/notificacao/MarcarNotificacaoComoLidaUseCase';
import { NotificacaoEntity } from '../../domain/entities/NotificacaoEntity';
import AppError from '../../application/errors/AppError';

export class NotificacaoController {

    constructor(
       private contarNotificacoesNaoLidasUseCase: ContarNotificacoesNaoLidasUseCase,
       private marcarNotificacaoComoLidaUseCase: MarcarNotificacaoComoLidaUseCase,
       private listarNotificacoesUseCase: ListarNotificacoesUseCase
    ) { }

    
    // Listar notificações do usuário com paginação
    listarNotificacoes = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const usuarioId = req.usuario?.id;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const filtro = req.query.filtro as string[];

            if (!usuarioId) throw new AppError('ID do usuário não encontrado', 401);

            if (isNaN(usuarioId)) throw new AppError('ID de Usuário inválido.', 400);
            

            const notificacoes = await this.listarNotificacoesUseCase.execute({usuarioId, page, limit, filtro});
            return res.status(200).json(notificacoes);
        } catch (error: any) {
            next(error);
        }
    }

    // Marcar notificação como lida
    marcarComoLida = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const usuarioId = req.usuario?.id;
            const notificacaoId = parseInt(req.params.notificacaoId, 10);

            console.log(notificacaoId)
            if (isNaN(usuarioId)) throw new AppError('ID de Usuário inválido.', 400);
            

            await this.marcarNotificacaoComoLidaUseCase.execute({usuarioId, notificacaoId});

            return res.status(200).json({ message: 'Notificação marcada como lida com sucesso.' });
        } catch (error: any) {
            next(error);
        }
    }

    totalNaoLidas = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const usuarioId = req.usuario?.id;

            if (isNaN(usuarioId)) throw new AppError('ID de Usuário inválido.', 400);
               
            
            const totalNaoLidas = await this.contarNotificacoesNaoLidasUseCase.execute(usuarioId);
            return res.status(200).json({ totalNaoLidas });
        } catch (error: any) {
            next(error);
        }
    }
}