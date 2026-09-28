// src/infrastructure/http/controllers/SessaoController.ts

import { Request, Response, NextFunction } from 'express';
import { EncerrarSessaoUseCase } from '../../application/use-cases/sessao/EncerrarSessaoUseCase';
import { ObterRelatorioSessaoUseCase } from '../../application/use-cases/sessao/ObterRelatorioSessaoUseCase';
import { GerarAcessoSessaoUseCase } from '../../application/use-cases/sessao/GerarAcessoSessaoUseCase';
import { ListarRelatoriosUseCase } from '../../application/use-cases/sessao/ListarRelatoriosUseCase';
import { ComentarRelatorioUseCase } from '../../application/use-cases/sessao/ComentarRelatorioUseCase';
import { AvaliarSessaoUseCase } from '../../application/use-cases/sessao/AvaliarSessaoUseCase';



export class SessaoController {
    constructor(
        private encerrarSessaoUseCase: EncerrarSessaoUseCase,
        private obterRelatorioSessaoUseCase: ObterRelatorioSessaoUseCase,
        private gerarAcessoUseCase: GerarAcessoSessaoUseCase,
        private listarRelatoriosUseCase: ListarRelatoriosUseCase,
        private comentarRelatorioUseCase: ComentarRelatorioUseCase,
        private avaliarSessaoUsecase: AvaliarSessaoUseCase) { }

    async encerrar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { id: sessaoId } = req.params;
        const profissionalId = req?.usuario?.id;

        try {
            await this.encerrarSessaoUseCase.execute({
                sessaoId,
                usuarioId: profissionalId
            });

            return res.status(200).json({
                message: "Sessão encerrada com sucesso. O relatório de análise será gerado em instantes."
            });

        } catch (error: any) {

            next(error);
        }
    }

    async obterRelatorio(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {

            const result = await this.obterRelatorioSessaoUseCase.execute({
                sessaoId: req.params.id,
                usuarioId: req?.usuario.id,
                usuarioTipo: req?.usuario.tipo // 'profissional' ou 'paciente'
            });

            return res.status(200).json(result);
        } catch (error: any) {

            next(error);
        }
    }

    async obterAcesso(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;
            const usuarioId = req?.usuario.id;
            const tipoUsuario = req?.usuario.tipo;

            console.log("controller:", id);

            const acesso = await this.gerarAcessoUseCase.execute(id, usuarioId, tipoUsuario);

            res.cookie(
                "signalingToken",
                acesso.tokenSinalizacao,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 5 * 60 * 1000
                }
            );

            return res.status(200).json({sessaoId: acesso.sessaoId, iceServers: acesso.iceServers});
        } catch (error: any) {

            next(error);
        }
    }

    async relatorios(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const id = req?.usuario.id;
            const { page, limit, codinome, emocao, ordem } = req.query;

            const codinomeStr = typeof codinome === 'string' ? codinome : undefined;
            const emocaoStr = typeof emocao === 'string' ? emocao : undefined;
            const ordemStr = typeof ordem === 'string' ? ordem : undefined;

            const relatorios = await this.listarRelatoriosUseCase.execute({
                profissionalId: id,
                page: Number(page),
                limit: Number(limit),
                codinome: codinomeStr,
                emocao: emocaoStr,
                ordem: ordemStr
            });
            return res.status(200).json(relatorios);

        } catch (error: any) {
            next(error);
        }
    }

    async comentario(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const profissionalId = req?.usuario.id;
            const { id } = req.params;
            const { comment } = req.body;

            const resultado = await this.comentarRelatorioUseCase.execute({ profissionalId, sessaoId: id, comentario: comment });

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }

    }

    async avaliarSessao(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const profissionalId = req?.usuario.id;
            const { sessaoId } = req.params;
            const { nota, comentario } = req.body;

            const comentar = await this.avaliarSessaoUsecase.execute({ pacienteId: Number(profissionalId), sessaoId, nota, comentario });

            return res.status(200).json(comentar);

        } catch (error: any) {
            next(error);
        }
    }
}