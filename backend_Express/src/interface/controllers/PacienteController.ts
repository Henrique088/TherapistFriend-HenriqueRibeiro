// src/interface/controllers/PacienteController.ts


import { Request, Response, NextFunction } from 'express';
import { CriarPacienteUseCase } from '../../application/use-cases/paciente/CriarPacienteUseCase';
import { BuscarPacientePorUsuarioUseCase } from '../../application/use-cases/paciente/BuscarPacientePorUsuarioUseCase';
import { AtualizarPacienteUseCase } from '../../application/use-cases/paciente/AtualizarPacienteUseCase';
import AppError from '../../application/errors/AppError';


export class PacienteController {


    constructor(
       private criarPacienteUseCase: CriarPacienteUseCase,
       private buscarPacientePorUsuarioIdUseCase: BuscarPacientePorUsuarioUseCase,
       private atualizarPacienteUseCase: AtualizarPacienteUseCase
    ) { }

    /**
     * POST /pacientes
     */
    criar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
           
            const paciente = await this.criarPacienteUseCase.execute(req.body);

            return res.status(201).json(paciente);

        } catch (error: any) {
            
            next(error);
        }
    }

    /**
     * GET /pacientes/usuario/:idUsuario
     */
    buscarPorUsuarioId = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // Converte o parâmetro de rota para número
            const idUsuario = parseInt(req.params.idUsuario, 10);

            
            if (isNaN(idUsuario)) {
                throw new AppError('ID de Usuário inválido.', 400);
            }

            const paciente = await this.buscarPacientePorUsuarioIdUseCase.execute({ idUsuario });

            if (!paciente) {
                throw new AppError('Paciente não encontrado.', 404);
            }


            return res.json(paciente);

        } catch (error: any) {
        
            next(error)
        }
    }

    /**
     * PUT /pacientes/:id
     */
    atualizar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {

            const dadosAtualizacao = req.body;
            const idUsuario = req.usuario?.id

            if (!idUsuario) {
                throw new AppError('Usuário não autenticado.', 401);
            }
            const pacienteAtualizado = await this.atualizarPacienteUseCase.execute({ idUsuario, ...dadosAtualizacao });

            if (!pacienteAtualizado) {
                throw new AppError('Paciente não encontrado para atualização.', 404);
            }

            return res.json(pacienteAtualizado);

        } catch (error: any) {
            next(error);
        }
    }
}
