// src/interface/controllers/RelatosControllers.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../../application/errors/AppError';
import { CriarRelatoUseCase } from '../../application/use-cases/relato/CriarRelatoUseCase';
import { AssumirRelatoUseCase } from '../../application/use-cases/relato/AssumirRelatoUseCase';
import { DecidirVinculoUseCase } from '../../application/use-cases/relato/DecidirVinculoUseCase';
import { RecusarRelatoUseCase } from '../../application/use-cases/relato/RecusarRelatoUseCase';
import { ListarRelatosDisponiveisUseCase } from '../../application/use-cases/relato/ListarRelatosDisponiveisUseCase';
import { ListarRelatosPacientesUseCase } from '../../application/use-cases/relato/ListarRelatosPacientes';
import { DeletarRelatoUseCase } from '../../application/use-cases/relato/DeletarRelatoUseCase';
import { AtualizarRelatoUseCase } from '../../application/use-cases/relato/AtualizarRelatoUseCase';

export class RelatoController {
    constructor(
        private criarRelatoUseCase: CriarRelatoUseCase,
        private assumirRelatoUseCase: AssumirRelatoUseCase,
        private decidirVinculoUseCase: DecidirVinculoUseCase,
        private recusarRelatoUseCase: RecusarRelatoUseCase,
        private listarRelatosDisponiveisUseCase: ListarRelatosDisponiveisUseCase,
        private listarRelatosParaPacientesUseCase: ListarRelatosPacientesUseCase,
        private DeletarRelatoUseCase: DeletarRelatoUseCase,
        private atualizarRelatoUseCase: AtualizarRelatoUseCase
    ) { }

    // Criar novo relato (Paciente)
    criar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paciente_id = req.usuario?.id;
            const relato = await this.criarRelatoUseCase.execute({
                paciente_id,
                ...req.body,
                
            });
            return res.status(201).json(relato);
        } catch (error: any) {
            next(error);
        }
    };

    // Listar relatos para profissionais (Paginação)
    listarDisponiveis = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resultado = await this.listarRelatosDisponiveisUseCase.execute({
                // Garante o ID e lança erro se não existir (Proteção de tipo)
                profissionalId: req.usuario!.id,

                // Converte e define default na mesma linha
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,

              
                gravidade: req.query.gravidade as string[],
                busca: req.query.busca as string
            });

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }
    };;

    // Profissional solicita assumir o relato
    assumir = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profissionalId = req.usuario?.id;
            const relatoId = parseInt(req.params.relatoId);

            if (!profissionalId) throw new AppError('Não autorizado', 401);

            const relato = await this.assumirRelatoUseCase.execute({ relatoId, profissionalId });
            return res.status(200).json(relato);
        } catch (error: any) {
            next(error);
        }
    };

    // 4. Profissional recusa ou desiste do relato
    recusar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profissionalId = req.usuario?.id;
            const relatoId = parseInt(req.params.id);

            if (!profissionalId) throw new AppError('Não autorizado', 401);

            const relato = await this.recusarRelatoUseCase.execute({ relatoId, profissionalId });
            return res.status(200).json(relato);
        } catch (error: any) {
            next(error);
        }
    };

    // 5. Paciente aceita ou recusa o profissional interessado
    decidirVinculo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const pacienteId = req.usuario?.id;
            const relatoId = parseInt(req.params.id);
            const { profissionalId, decisao } = req.body;

            console.log('Decidir Vínculo:', { pacienteId, relatoId, profissionalId, decisao });

            if (!pacienteId) throw new AppError('Não autorizado', 401);

            const relato = await this.decidirVinculoUseCase.execute(
                {
                    relatoId,
                    pacienteId,
                    profissionalId,
                    decisao
                }
            );
            return res.status(200).json(relato);
        } catch (error: any) {
            next(error);
        }
    };

    listarParaPaciente = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resultado = await this.listarRelatosParaPacientesUseCase.execute({
                
                pacienteId: req.usuario!.id,  // ! garante que não seja null ou undefined

                // Converte e define default na mesma linha
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,

                busca: req.query.busca as string
            });

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }
    }

    deletarRelato = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuarioId = req.usuario?.id;
            const relatoId = req.params.relatoId;

            if (!usuarioId) throw new AppError('Não autorizado', 401);

            await this.DeletarRelatoUseCase.execute({ usuarioId, relatoId: Number(relatoId) });
            return res.status(200).send('Deletado com sucesso');
        }
        catch (error: any){
            next(error);
        }
    }

    atualizarRelato = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuarioId = req.usuario?.id;
            const relatoId = parseInt(req.params.relatoId, 10);
            const dadosAtualizacao = req.body;

            if (!usuarioId) throw new AppError('Não autorizado', 401);

            const relatoAtualizado = await this.atualizarRelatoUseCase.execute({
                usuarioId,
                relatoId,
                novoConteudo: dadosAtualizacao
            });

            return res.status(200).json(relatoAtualizado);
        } catch (error: any) {
            next(error);
        }
    }

}