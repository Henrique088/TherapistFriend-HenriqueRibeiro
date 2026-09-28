// src/interface/http/controllers/ProfissionalController.ts

import { Request, Response, NextFunction } from 'express';
import { CompletarPerfilProfissionalUseCase } from '../../application/use-cases/profissional/CompletarPerfilProfissionalUseCase';
import { ListarProfissionalUseCase } from '../../application/use-cases/profissional/ListarProfissionaisUseCase';
import AppError from '../../application/errors/AppError';
import { PerfilPublicoProfissional } from '../../application/use-cases/profissional/PerfilPublicoProfissionalUseCase';



export class ProfissionalController {
    constructor(
        private completarPerfilUseCase: CompletarPerfilProfissionalUseCase,
        private listarProfissionaisUseCase: ListarProfissionalUseCase,
        private perfilPublicoProfissional:   PerfilPublicoProfissional
    ) { }

    async completarPerfil(req: Request, res: Response, next: NextFunction) {

        try {

            const idUsuario = req.usuario?.id;

            if (!idUsuario) {
                throw new AppError("Usuário não identificado. Faça login novamente.", 401);
            }

            const { cpf, crp, bio, especialidadesIds } = req.body;
            console.log(especialidadesIds)
            const profissionalAtualizado = await this.completarPerfilUseCase.execute(idUsuario, {
                cpf,
                crp,
                bio,
                especialidadesIds
            });

            return res.status(200).json({
                message: "Perfil profissional completado com sucesso!",
                data: profissionalAtualizado
            });

        } catch (error: any) {
            
            if (error instanceof AppError) {
                next(error)
            }

            console.error("Erro no Controller Profissional:", error);
            return res.status(500).json({ error: "Erro interno ao processar o perfil." });
        }
    }
    async buscar(req: Request, res: Response, next: NextFunction) {
        try {
            const resultado = await this.listarProfissionaisUseCase.execute({
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                nome: req.query.nome as string,
                especialidade: req.query.especialidade as string
            });

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }

    }

    async perfilPublico(req: Request, res: Response, next: NextFunction) {
        try{
            const { id } = req.params;

            const perfil = await this.perfilPublicoProfissional.execute(Number(id));

            return res.status(200).json(perfil);
            
        }catch(error: any){
            next(error);
        }
    }

}