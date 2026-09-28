// src/interface/http/controllers/ConversaController.ts

import {  Request, Response,NextFunction } from 'express';
import { ListarConversasUseCase } from '../../application/use-cases/chat/ListarConversasUseCase';


export class ConversaController {
    constructor(
        private listarConversasUseCase: ListarConversasUseCase
    ) { }

    async listarConversas(req: Request, res: Response, next: NextFunction): Promise<Response | void> {

        const usuarioId = req.usuario.id;

        try {
            const conversas = await this.listarConversasUseCase.execute({
                usuarioId
            });

            return res.json(conversas);
        } catch (error: any) {
            next(error);
        }
    }






}