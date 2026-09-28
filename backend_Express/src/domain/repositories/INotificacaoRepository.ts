// src/domain/repositories/INotificacaoRepository.ts

import { NotificacaoEntity, NotificacaoProps } from '../entities/NotificacaoEntity';

export interface INotificacaoRepository {
    /**
     * Persiste uma nova notificação no banco de dados.
     * @param dados Propriedades da notificação vindas do domínio.
     */
    criar(dados: NotificacaoProps): Promise<NotificacaoEntity>;

    /**
     * Busca todas as notificações de um usuário específico,
     * geralmente ordenadas pela data de criação (mais recentes primeiro).
     */
    buscarPorUsuario(usuarioId: number): Promise<NotificacaoEntity[]>;

    /**
     * Atualiza o status de uma notificação para 'lida'.
     */
    marcarComoLida(usuarioId: number,notificacaoId: number): Promise<void>;

    /**
     * Busca uma notificação específica por ID.
     * Útil para validar se a notificação pertence ao usuário antes de marcar como lida.
     */
    buscarPorId(notificacaoId: number): Promise<NotificacaoEntity | null>;

    /**
     * Conta quantas notificações não lidas o usuário possui.
     * Útil para exibir o "dot" de contagem no frontend.
     */
    contarNaoLidas(usuarioId: number): Promise<number>;

    listar(usuarioId: number, page: number, limit: number, filtro?: string[]): Promise<{
    notificacoes: NotificacaoEntity[];
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
}>;
}