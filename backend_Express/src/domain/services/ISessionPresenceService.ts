export interface ISessionPresenceService {

    /**
     * Participante entrou na sessão.
     */
    userJoined( sessaoId: string, usuarioId: number ): Promise<void>;

    /**
     * Participante saiu da sessão.
     */
    userLeft( sessaoId: string, usuarioId: number ): Promise<void>;

    /**
     * Retorna quantos participantes estão online.
     */
    getOnlineCount( sessaoId: string ): Promise<number>;

    /**
     * Verifica se existe alguém conectado.
     */
    hasOnlineParticipants( sessaoId: string ): Promise<boolean>;

    /**
     * Remove todas as informações da sessão.
     */
    clearSession( sessaoId: string ): Promise<void>;
}