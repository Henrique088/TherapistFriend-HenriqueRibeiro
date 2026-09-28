// src/infrastructure/services/SessionPresenceService.ts

import { ISessionPresenceService } from "../../domain/services/ISessionPresenceService";
import { IRedisClient } from "../../domain/services/IRedisClient";

export class SessionPresenceService implements ISessionPresenceService {

    constructor( private readonly redis: IRedisClient ) { }

    /**
     * Monta a chave Redis da sessão.
     */
    private getPresenceKey( sessaoId: string ): string {

        return `presence:sessao:${sessaoId}`;
    }

    /**
     * Registra um participante online.
     */
    async userJoined( sessaoId: string, usuarioId: number ): Promise<void> {

        const key = this.getPresenceKey(sessaoId);

        await this.redis.sadd( key, usuarioId.toString() );

        /**
         * Segurança:
         * caso algo falhe, o Redis limpa sozinho.
         */
        await this.redis.expire( key, 7200 );

        console.log( `🟢 Usuário ${usuarioId} entrou na sessão ${sessaoId}` );
    }

    /**
     * Remove um participante online.
     */
    async userLeft( sessaoId: string, usuarioId: number ): Promise<void> {

        const key = this.getPresenceKey(sessaoId);

        await this.redis.srem( key, usuarioId.toString() );

        console.log( `🔴 Usuário ${usuarioId} saiu da sessão ${sessaoId}` );
    }

    /**
     * Quantidade de participantes online.
     */
    async getOnlineCount( sessaoId: string ): Promise<number> {

        const key = this.getPresenceKey(sessaoId);

        return this.redis.scard(key);
    }

    /**
     * Existe alguém conectado?
     */
    async hasOnlineParticipants( sessaoId: string ): Promise<boolean> {

        const total = await this.getOnlineCount( sessaoId );

        return total > 0;
    }

    /**
     * Remove completamente a presença da sessão.
     */
    async clearSession( sessaoId: string ): Promise<void> {

        const key = this.getPresenceKey(sessaoId);

        await this.redis.del(key);

        console.log( `🧹 Presença removida da sessão ${sessaoId}` );
    }
}