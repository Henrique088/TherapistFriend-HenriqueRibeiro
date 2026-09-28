// src/infrastructure/services/SessionRuntimeService.ts

import { ParticipantPresence } from "../../domain/entities/ParticipantPresence";
import { IRedisClient } from "../../domain/services/IRedisClient";
import { ISessionRuntimeService } from "../../domain/services/ISessionRuntimeService";

export class SessionRuntimeService implements ISessionRuntimeService {

    constructor(
        private readonly redis: IRedisClient
    ) { }

    /**
     * Registra que um usuário possui credencial
     * válida para esta sessão.
     */
    async registerCredential(sessaoId: string, userId: number): Promise<void> {

        const key = `turn:active:${sessaoId}`;

        await this.redis.sadd(key, userId.toString());

        /**
         * Define TTL apenas caso ainda
         * não exista.
         */
        const ttl = await this.redis.ttl(key);

        if (ttl <= 0) {

            await this.redis.expire(key, 3600);
        }

        console.log(`🟢 Usuário ${userId} registrado para emissão de credenciais da sessão ${sessaoId}`);

    }

    /**
     * Verifica se o usuário possui
     * credencial registrada.
     */
    async isRegistered(sessaoId: string, userId: number): Promise<boolean> {

        return this.redis.sismember(`turn:active:${sessaoId}`, userId.toString());

    }

    /**
     * Marca que a sessão realmente iniciou
     * (primeiro Offer recebido).
     */
    async markSessionStarted(sessaoId: string): Promise<void> {

        await this.redis.set( `turn:started:${sessaoId}`, "1", 7200 );

        await this.registerActiveSession(sessaoId);

        console.log(`🎥 Sessão ${sessaoId} iniciada`);

    }

    /**
     * Verifica se a sessão já iniciou.
     */
    async isSessionActive(sessaoId: string): Promise<boolean> {

        return this.redis.exists(`turn:started:${sessaoId}`);
    }

    /**
     * Remove todos os dados temporários
     * relacionados à sessão.
     */
    async invalidateSession(sessaoId: string): Promise<void> {

        console.log(`🗑 Limpando dados TURN da sessão ${sessaoId}`);

        await this.removeActiveSession(sessaoId);

        await this.redis.del(
            `turn:started:${sessaoId}`,
            `turn:active:${sessaoId}`,
            `turn:presence:${sessaoId}`
        );

    }

    /**
     * Registra uma sessão como ativa.
    */
    async registerActiveSession(sessaoId: string): Promise<void> {

        await this.redis.sadd(  "turn:sessions", sessaoId );

    }

    /**
     * Remove uma sessão ativa.
     */
    async removeActiveSession(sessaoId: string): Promise<void> {

        await this.redis.srem( "turn:sessions", sessaoId );

    }

    /**
     * Lista todas as sessões ativas.
     */
    async getActiveSessions(): Promise<string[]> {

        return this.redis.smembers( "turn:sessions" );

    }

    /**
     * Registra a presença de um participante na sessão.
     */
    async registerPresence( sessaoId: string, usuarioId: number ): Promise<void> {

        console.log( `➡️ Registrando presença ${usuarioId} na sessão ${sessaoId}` );

        const presence = await this.loadPresence(sessaoId);

        presence[usuarioId] = {

            usuarioId,

            online: true,

            heartbeat: Date.now()

        };

        await this.savePresence( sessaoId, presence );

        console.log( `🟢 Presença registrada ${usuarioId}` );

    }

    async updateHeartbeat( sessaoId: string, usuarioId: number ): Promise<void> {

        console.log( `➡️ Atualizando heartbeat ${usuarioId} na sessão ${sessaoId}` );
        
        const presence = await this.loadPresence(sessaoId);



        if (!presence[usuarioId]) {

            presence[usuarioId] = {

                usuarioId,

                online: true,

                heartbeat: Date.now()

            };

        } else {

            presence[usuarioId].heartbeat = Date.now();

            presence[usuarioId].online = true;

        }

        await this.savePresence( sessaoId, presence );

    }

    async markOffline( sessaoId: string, usuarioId: number ): Promise<void> {

        const presence = await this.loadPresence(sessaoId);

        if (!presence[usuarioId])
            return;

        presence[usuarioId].online = false;

        await this.savePresence( sessaoId, presence );

    }

    async getParticipantPresence( sessaoId: string, usuarioId: number ): Promise<ParticipantPresence | null> {

        const presence = await this.loadPresence(sessaoId);

        return presence[usuarioId] ?? null;

    }

    async getPresence( sessaoId: string ): Promise<ParticipantPresence[]> {

        const presence = await this.loadPresence(sessaoId);

        return Object.values(presence);

    }


    private getPresenceKey(sessaoId: string): string {

        return `turn:presence:${sessaoId}`;

    }

    private async loadPresence( sessaoId: string ): Promise<Record<string, ParticipantPresence>> {

        const json = await this.redis.get(

            this.getPresenceKey(sessaoId)

        );

        if (!json)
            return {};

        return JSON.parse(json);

    }

    private async savePresence( sessaoId: string, presence: Record<string, ParticipantPresence> ): Promise<void> {

        await this.redis.set(

            this.getPresenceKey(sessaoId),

            JSON.stringify(presence),

            7200

        );

    }

}