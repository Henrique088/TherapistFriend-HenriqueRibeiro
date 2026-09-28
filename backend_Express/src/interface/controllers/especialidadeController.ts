// src/interface/controllers/especialiadeController.ts

import { Request, Response, NextFunction } from 'express';
import { ListarEspecialidadesUseCase } from '../../application/use-cases/especialidades/ListarEspecialidadesUseCase';



export class EspecialidadeController {
    constructor (private listarEspecilaideUseCase: ListarEspecialidadesUseCase) {}


    listar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const especialidades = await this.listarEspecilaideUseCase.execute();
            return res.status(200).json(especialidades)
        } catch (error: any) {
            next(error);
        }
    }
}

