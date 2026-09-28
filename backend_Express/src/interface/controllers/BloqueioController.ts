// src/infrastructure/http/controllers/BloqueioController.ts

import { Request, Response, NextFunction } from 'express';

import { CriarBloqueioUseCase } from '../../application/use-cases/agenda/CriarBloqueioUseCase';
import { AdicionarExcecaoBloqueioUseCase } from '../../application/use-cases/agenda/AdicionarExcecaoBloqueioUseCase';
import { RemoverBloqueioUseCase } from '../../application/use-cases/agenda/RemoverBloqueioUseCase';
import { RemoverExcecaoUseCase } from '../../application/use-cases/agenda/RemoverExcecaoUseCase';


export class BloqueioController {

    constructor(
            private criarBloqueioUseCase: CriarBloqueioUseCase,
            private adicionarExcecaoBloqueioUseCase: AdicionarExcecaoBloqueioUseCase,
            private removerBloqueioUseCase: RemoverBloqueioUseCase,
            private removerExcecaoUseCase : RemoverExcecaoUseCase
        ) { }

    async criar(req: Request, res: Response, next: NextFunction) {
        try {

           
            const bloqueio = await this.criarBloqueioUseCase.execute(req.body);
            return res.status(201).json(bloqueio);
        } catch (error: any) {
            next(error);
        }
    }

    async adicionarExcecao(req: Request, res: Response, next: NextFunction) {
        try {
            const d = new Date(req.body.dataExcecao);
            
            await this.adicionarExcecaoBloqueioUseCase.execute({
                profissionalId: Number(req.body.profissionalId),
                bloqueioId: Number(req.body.bloqueioId),
                dataExcecao: new Date(Date.UTC(
                    d.getUTCFullYear(),
                    d.getUTCMonth(),
                    d.getUTCDate(),
                    0, 0, 0
                )),
                motivo: req.body.motivo
            });
            return res.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }

    async remover(req: Request, res: Response, next: NextFunction) {
        try {

            const profissionalId = Number(req.params.profissionalId);
            const bloqueioId = Number(req.params.bloqueioId);

            
            await this.removerBloqueioUseCase.execute({ profissionalId, bloqueioId });
            return res.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }

    async removerExcecao(req: Request, res: Response, next: NextFunction) {
        try {

            const profissionalId = Number(req.query.profissionalId);
            const bloqueioId = Number(req.query.bloqueioId);
            const excecaoId = Number(req.params.excecaoId);

            await this.removerExcecaoUseCase.execute({ profissionalId, bloqueioId, excecaoId });
            return res.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }
}