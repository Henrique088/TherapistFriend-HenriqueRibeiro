// src/interface/controllers/MoodController.ts

import { Request, Response, NextFunction } from 'express';
import { RegistrarMoodUseCase } from '../../application/use-cases/mood/RegistrarMoodUseCase';
import { GerarCardsPorMoodUseCase } from '../../application/use-cases/mood/GerarCardsPorMoodUseCase';
import AppError from '../../application/errors/AppError';

export class MoodController {
    constructor(
        private registrarMoodUseCase: RegistrarMoodUseCase,
        private gerarCardsPorMoodUseCase: GerarCardsPorMoodUseCase) { }


    registrar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const usuarioId = req.usuario?.id;
        const { mood, intensidade } = req.body;

        try {

            const resultado = await this.registrarMoodUseCase.execute({ usuarioId, mood, intensidade })

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }
    }

     gerarCards = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> =>{
        const usuarioId = req.usuario?.id;

    try {
        const cards = await this.gerarCardsPorMoodUseCase.execute(usuarioId);

        return res.json(cards);

    } catch (error: any) {
        throw new AppError("Erro ao gerar cards")
    }
}

}