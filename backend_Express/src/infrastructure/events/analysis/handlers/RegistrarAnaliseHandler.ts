// // src/infrastructure/repositories/RedisAnalysisRepository.ts

// import { IAnalysisCacheRepository } from '../../../../domain/repositories/IAnalysisCacheRepository';
// import { redisConnection } from '../../../config/redis';

// export class RedisAnalysisRepository implements IAnalysisCacheRepository {
//     private readonly PREFIX = 'sessao:analise:';

//     async saveFrame(sessaoId: string, data: any): Promise<void> {
//         const key = `${this.PREFIX}${sessaoId}`;
//         await redisConnection.rpush(key, JSON.stringify(data));
//         await redisConnection.expire(key, 86400);
//     }

//     async getFrames(sessaoId: string): Promise<any[]> {
//         const logs = await redisConnection.lrange(`${this.PREFIX}${sessaoId}`, 0, -1);
//         return logs.map(l => JSON.parse(l));
//     }

//     async deleteFrames(sessaoId: string): Promise<void> {
//         await redisConnection.del(`${this.PREFIX}${sessaoId}`);
//     }
// }