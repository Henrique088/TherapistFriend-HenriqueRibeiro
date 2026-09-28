// src/interface/controllers/DisponibilidadeController.ts

import { Request, Response, NextFunction } from 'express';
import { SalvarGradeDisponibilidadeUseCase } from '../../application/use-cases/agenda/SalvarGradeDisponibilidadeUseCase';

export class DisponibilidadeController {
   
    constructor(
        private salvarGradeUseCase: SalvarGradeDisponibilidadeUseCase
    ) {}

    async salvar(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;
            const grades = req.body; 

            await this.salvarGradeUseCase.execute(Number(profissionalId), grades);

            return res.status(200).json({ message: "Grade de horários atualizada com sucesso." });
        } catch (error: any) {
            
            next(error);
        }
    }
}