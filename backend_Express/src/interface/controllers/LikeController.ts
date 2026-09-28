// src/interface/controllers/LikeController.ts

import { Request, Response, NextFunction } from 'express';
import { AlternarLikeRelatoUseCase } from '../../application/use-cases/relato/AlternarLikeRelatoUseCase';

export class LikeController {
    constructor(private alternarLikeUseCase: AlternarLikeRelatoUseCase) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            
            const usuarioId = req.usuario.id; 
            const { relatoId } = req.params;

            const resultado = await this.alternarLikeUseCase.execute(
                Number(usuarioId), 
                Number(relatoId)
            );

            
            return res.status(200).json(resultado);
        } catch (error) {
          next(error);
        }
    }
}