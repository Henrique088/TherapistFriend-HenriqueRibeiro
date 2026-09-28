// src/application/use-cases/chat/ListarConversasUseCase.ts

import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import { ConversaEntity } from '../../../domain/entities/ConversaEntity';
import AppError from '../../errors/AppError';
import { ListarConversasDTO, ListarConversaResponseDTO } from '../../dtos/ConversaDTO';


export class ListarConversasUseCase {
    constructor(
        private conversaRepository: IConversaRepository
    ) {}

    async execute({ usuarioId }: ListarConversasDTO): Promise<ConversaEntity[] | null> {
        

        // Buscar mensagens 
        return await this.conversaRepository.buscarConversas(usuarioId);
    }
}