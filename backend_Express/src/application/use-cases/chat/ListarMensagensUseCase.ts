// src/application/use-cases/chat/ListarMensagensUseCase.ts

import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import { MensagemEntity } from '../../../domain/entities/MensagemEntity';
import AppError from '../../errors/AppError';
import { ListarMensagensDTO } from '../../dtos/MensagemDTO';
import { dot } from 'node:test/reporters';


export class ListarMensagensUseCase {
    constructor(
        private mensagemRepository: IMensagemRepository,
        private conversaRepository: IConversaRepository
    ) { }

    async execute(dto: ListarMensagensDTO): Promise<MensagemEntity[]> {
        const { conversaId, usuarioId, limit, cursor } = dto;

        // Valida se a conversa existe
        const conversa = await this.conversaRepository.buscarPorId(conversaId);
        if (!conversa) {
            throw new AppError('Conversa não encontrada.', 404);
        }

        // Segurança
        if (conversa.pacienteId !== usuarioId && conversa.profissionalId !== usuarioId) {
            throw new AppError('Você não tem permissão para ver estas mensagens.', 403);
        }

        const effectiveLimit = limit || 50; // mantém padrão do front

        const parsedCursor = cursor ? new Date(cursor) : undefined;

        return await this.mensagemRepository.buscarPorConversa(
            conversaId,
            effectiveLimit,
            parsedCursor
        );
    }

}