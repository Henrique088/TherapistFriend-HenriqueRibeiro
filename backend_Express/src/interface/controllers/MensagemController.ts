// src/interface/http/controllers/MensagemController.ts

import { Request, Response, NextFunction } from 'express';
import { EnviarMensagemUseCase } from '../../application/use-cases/chat/EnviarMensagemUseCase';
import { ListarMensagensUseCase } from '../../application/use-cases/chat/ListarMensagensUseCase';
import { EditarMensagemUseCase } from '../../application/use-cases/chat/EditarMensagemUseCase';
import { VisualizarMensagemUseCase } from '../../application/use-cases/chat/VisualizarMensagemUseCase';
import { DeletarMensagemUseCase } from '../../application/use-cases/chat/DeletarMensagemUseCase';
import { ContarMensagensNaoLidasUseCase } from '../../application/use-cases/chat/ContarMensagensNaoLidasUseCase';


export class MensagemController {
    constructor(
        private enviarMensagemUseCase: EnviarMensagemUseCase,
        private listarMensagensUseCase: ListarMensagensUseCase,
        private editarMensagemUseCase: EditarMensagemUseCase,
        private visualizarMensagemUseCase: VisualizarMensagemUseCase,
        private deletarMensagemUseCase: DeletarMensagemUseCase,
        private contarMensagensNaoLidasUseCase: ContarMensagensNaoLidasUseCase
    ) {}

    async enviar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { conversaId } = req.params;
        const { texto } = req.body;
        const usuarioId = (req as any).usuario.id; 

        try {
            const mensagem = await this.enviarMensagemUseCase.execute({
                conversaId: Number(conversaId),
                remetenteId: usuarioId,
                texto
            });

            return res.status(201).json(mensagem);
        } catch (error: any) {
            next(error);
        }
    }

    async listarHistorico(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { conversaId } = req.params;
        const { cursor, limit } = req.query;
        const usuarioId = req.usuario.id; 

        try {
            const mensagens = await this.listarMensagensUseCase.execute({
                conversaId: Number(conversaId),
                usuarioId,
                cursor: new Date(cursor as string), 
                limit: Number(limit) || 50
            });

            return res.json(mensagens);
        } catch (error: any) {
            next(error);
        }
    }

    async editar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { mensagemId } = req.params;
        const { novoTexto } = req.body;
        const usuarioId = req.usuario.id;

        try {
            await this.editarMensagemUseCase.execute(
                {mensagemId: Number(mensagemId), usuarioId, novoTexto}
            );
            return res.status(200).json({ message: 'Mensagem editada com sucesso.' });
        }
        catch (error: any) {
            next(error);
        }
    }

    async visualizar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { mensagemIds } = req.body;
        const usuarioId = req.usuario.id;

        try {
            await this.visualizarMensagemUseCase.execute(
                {mensagemIds, usuarioId}
            );
            return res.status(200).json({ message: 'Mensagens marcadas como lidas.' });
        } catch (error: any) {
            next(error);
        }
    }

    async deletar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { mensagemId } = req.params;
        const usuarioId = req.usuario.id;

        try {
            await this.deletarMensagemUseCase.execute(
                {mensagemId: Number(mensagemId), usuarioId}
            );
            return res.status(200).json({ message: 'Mensagem deletada com sucesso.' });
        } catch (error: any) {
            next(error);
        }
    }

    async totalNaoLidas(req: Request, res:Response, next: NextFunction): Promise<Response | void> {
        const usuarioId = req.usuario.id;

        try{
          const total =  await this.contarMensagensNaoLidasUseCase.execute({usuarioId});

          return res.json(total);
        
        } catch ( error: any){
            next(error);
        }
    }
}