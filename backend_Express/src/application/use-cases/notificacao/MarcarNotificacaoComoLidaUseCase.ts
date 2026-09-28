// src/application/use-cases/notificacao/MarcarNotificacaoComoLidaUseCase.ts
import { INotificacaoRepository } from '../../../domain/repositories/INotificacaoRepository';
import AppError from '../../errors/AppError';
import { MarcarLidaDTO } from '../../dtos/NotificacaoDTO';

export class MarcarNotificacaoComoLidaUseCase {
    constructor(private notificacaoRepository: INotificacaoRepository) {}

    async execute({notificacaoId, usuarioId}: MarcarLidaDTO): Promise<void> {
        // Busca a notificação
        const notificacao = await this.notificacaoRepository.buscarPorId(notificacaoId);


        if (!notificacao) {
            throw new AppError('Notificação não encontrada', 404);
        }

        // REGRA DE SEGURANÇA: Verifica se a notificação pertence ao usuário logado
        if (notificacao.usuarioId !== usuarioId) {
            throw new AppError('Não autorizado', 403);
        }

        //  Marcar como lida
        await this.notificacaoRepository.marcarComoLida(usuarioId, notificacaoId);
    }
}