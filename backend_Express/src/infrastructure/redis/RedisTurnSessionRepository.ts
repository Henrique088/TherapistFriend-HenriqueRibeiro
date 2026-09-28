// src/infrastructure/redis/RedisTurnSessionRepository.ts

import { redisConnection } from "../config/redis";
import { ITurnSessionRepository, TurnSessionData } from "../../domain/services/ITurnSessionRepository";

export class RedisTurnSessionRepository
    implements ITurnSessionRepository {

    private getKey(sessaoId: string, usuarioId: number) {
        return `turn:${sessaoId}:${usuarioId}`;
    }

    async salvarSessao(data: TurnSessionData): Promise<void> {

        const key = this.getKey(data.sessaoId, data.usuarioId);

        const ttl = Math.max( data.expiresAt - Math.floor(Date.now() / 1000), 60 );

        await redisConnection.set( key, JSON.stringify(data), "EX", ttl );
    }

    async buscarSessao( sessaoId: string, usuarioId: number ): Promise<TurnSessionData | null> {

        const key = this.getKey(sessaoId, usuarioId);

        const data = await redisConnection.get(key);

        if (!data)
            return null;

        return JSON.parse(data);
    }

    async marcarComoConectado( sessaoId: string, usuarioId: number ): Promise<void> {

        const sessao = await this.buscarSessao( sessaoId, usuarioId );

        if (!sessao)
            return;

        sessao.connected = true;

        sessao.connectedAt = Date.now();

        const ttl = await redisConnection.ttl( this.getKey(sessaoId, usuarioId) );

        await redisConnection.set(
            this.getKey(sessaoId, usuarioId),
            JSON.stringify(sessao),
            "EX",
            ttl
        );
    }

    async removerSessao( sessaoId: string, usuarioId: number ): Promise<void> {

        await redisConnection.del( this.getKey(sessaoId, usuarioId) );
    }
}