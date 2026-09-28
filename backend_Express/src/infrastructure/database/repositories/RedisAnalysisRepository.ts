// src/infrastructure/repositories/RedisAnalysisRepository.ts

import { IAnalysisCacheRepository } from '../../../domain/repositories/IAnalysisCacheRepository';
import { redisConnection } from '../../config/redis';

export class RedisAnalysisRepository  implements IAnalysisCacheRepository{
    private readonly PREFIX = 'sessao:analise:';

    async adicionarFrame(sessaoId: string, data: any): Promise<void> {
        const key = `${this.PREFIX}${sessaoId}`;
        const payload = JSON.stringify({
            ...data,
            at: Date.now()
        });

        // RPUSH adiciona ao final da lista (fila)
        await redisConnection.rpush(key, payload);
        
        // Define expiração de 24h para não sujar o Redis se a sessão cair
        await redisConnection.expire(key, 86400);
    }

    async buscarTodosFrames(sessaoId: string): Promise<any[]> {
        const key = `${this.PREFIX}${sessaoId}`;
        const logs = await redisConnection.lrange(key, 0, -1);
        return logs.map(log => JSON.parse(log));
    }

    async limparDados(sessaoId: string): Promise<void> {
        await redisConnection.del(`${this.PREFIX}${sessaoId}`);
    }
}



