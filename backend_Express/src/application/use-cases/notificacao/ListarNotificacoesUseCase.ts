// src/application/use-cases/notificacao/ListarNotificacaoesUseCase.ts

import { INotificacaoRepository } from '../../../domain/repositories/INotificacaoRepository';

import { ListarNotificacaoesDTO, listarResponseDTO } from '../../dtos/NotificacaoDTO';

export class ListarNotificacoesUseCase {
    constructor(private notificacaoRepository: INotificacaoRepository) {}

    async execute({usuarioId, page, limit, filtro}: ListarNotificacaoesDTO): Promise<listarResponseDTO> {
        return this.notificacaoRepository.listar(usuarioId, page, limit, filtro);
    }
}