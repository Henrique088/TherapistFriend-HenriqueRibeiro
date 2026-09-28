// src/application/use-cases/notificacao/ContarNotificacoesNaoLidasUseCase.ts

import { INotificacaoRepository } from '../../../domain/repositories/INotificacaoRepository';

export class ContarNotificacoesNaoLidasUseCase {
    constructor(private notificacaoRepository: INotificacaoRepository) {}

    async execute(usuarioId: number): Promise<number> {
        return this.notificacaoRepository.contarNaoLidas(usuarioId);
    }
}