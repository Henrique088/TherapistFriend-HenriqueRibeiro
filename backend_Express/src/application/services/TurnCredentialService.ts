// src/application/services/TurnCredentialService.ts

import crypto from "crypto";

import {
    IceServer,
    ITurnCredentialService,
} from "../../domain/services/ITurnCredentialService";

import { IRedisClient } from "../../domain/services/IRedisClient";
import { TurnConfig } from "./TurnConfig";

interface CachedTurnCredential {
    username: string;
    credential: string;
    expiresAt: number;
}

export class TurnCredentialService implements ITurnCredentialService {

    constructor(
        private readonly config: TurnConfig,

        private readonly redis: IRedisClient
    ) { }

    async generateIceServers( sessaoId: string, userId: number ): Promise<IceServer[]> {

        const cacheKey = `turn:sessao:${sessaoId}:usuario:${userId}`;

        console.log(`🔎 [TURN] Procurando credencial (${cacheKey})`);

        try {

            const cached = await this.redis.get(cacheKey);

            if (cached) {

                const credential: CachedTurnCredential = JSON.parse(cached);

                const now = Math.floor(Date.now() / 1000);

                const secondsRemaining = credential.expiresAt - now;

                console.log( `⌛ [TURN] Credencial encontrada (${secondsRemaining}s restantes)` );

                if (secondsRemaining > 60) {

                    console.log( "✅ [TURN] Reutilizando credencial existente." );

                    return this.buildIceServers(
                        credential.username,
                        credential.credential
                    );
                }

                console.log( "♻️ [TURN] Credencial próxima do vencimento." );
            }

        } catch (err) {

            console.warn( "⚠️ [TURN] Redis indisponível. Gerando credencial sem cache.", err );
        }

        console.log("🟡 [TURN] Gerando nova credencial.");

        const expiration = Math.floor(Date.now() / 1000) + this.config.ttl;

        const username = this.buildUsername(expiration, userId);

        const credential = this.generateCredential(username);

        const turnCredential: CachedTurnCredential = {
            username,
            credential,
            expiresAt: expiration
        };

        try {

            await this.redis.set( cacheKey, JSON.stringify(turnCredential), this.config.ttl );

            console.log( `💾 [TURN] Credencial salva no Redis (TTL ${this.config.ttl}s)` );

        } catch (err) {

            console.warn( "⚠️ [TURN] Não foi possível salvar a credencial no Redis.", err );
        }

        return this.buildIceServers(
            username,
            credential
        );
    }

    /**
     * Username temporário
     */
    private buildUsername( expiration: number, userId: number ): string {

        return `${expiration}:therapistfriend:${userId}`;
    }

    /**
     * Geração do HMAC SHA1
     */
    private generateCredential( username: string ): string {

        return crypto.createHmac( "sha1", this.config.secret ).update(username).digest("base64");
    }

    /**
     * Monta o array de ICE Servers
     */
    private buildIceServers( username: string, credential: string ): IceServer[] {

        return [
            {
                urls: `stun:${this.config.host}:${this.config.port}`
            },

            {
                urls: `turn:${this.config.host}:${this.config.port}`, username, credential
            }
        ];
    }
}