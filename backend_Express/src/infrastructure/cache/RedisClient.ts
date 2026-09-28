// src/infrastructure/cache/RedisClient.ts

import { redisConnection } from "../config/redis";
import { IRedisClient } from "../../domain/services/IRedisClient";

// Implementação do cliente Redis usando a interface IRedisClient
export class RedisClient implements IRedisClient {

    async get(key: string): Promise<string | null> {

        return redisConnection.get(key);
    }

    async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {

        if (ttlInSeconds) {

            await redisConnection.set(key, value, "EX", ttlInSeconds);

            return;

        }

        await redisConnection.set(key, value);
    }

    async del(...keys: string[]): Promise<void> {

        await redisConnection.del(...keys);
    }

    async exists(key: string): Promise<boolean> {

        return (await redisConnection.exists(key)) === 1;
    }

    /**
     * Lock distribuído
     */
    async acquireLock(key: string, ttlInSeconds: number): Promise<boolean> {

        const result = await redisConnection.set(key, "locked", "EX", ttlInSeconds, "NX");

        return result === "OK";
    }

    async releaseLock(key: string): Promise<void> {

        await redisConnection.del(key);
    }

    async expire(key: string, ttlInSeconds: number): Promise<void> {

        await redisConnection.expire(key, ttlInSeconds);
    }

    async ttl(key: string): Promise<number> {

        return redisConnection.ttl(key);
    }

    /**
     * ==========================
     * Sets
     * ==========================
     */

    async sadd(key: string, ...values: string[]): Promise<void> {

        if (!values.length)
            return;

        await redisConnection.sadd(key, ...values);
    }

    async srem(key: string, ...values: string[]): Promise<void> {

        if (!values.length)
            return;

        await redisConnection.srem(key, ...values);
    }

    async smembers(key: string): Promise<string[]> {

        return redisConnection.smembers(key);
    }

    async sismember(key: string, value: string): Promise<boolean> {

        const exists = await redisConnection.sismember(key, value);

        return exists === 1;
    }

    async scard(key: string): Promise<number> {

        return redisConnection.scard(key);
    }

    /**
     * ==========================
     * Busca por padrão
     * ==========================
     */

    async keys(pattern: string): Promise<string[]> {

        return redisConnection.keys(pattern);
    }

    /**
     * ==========================
     * Hashes
     * ==========================
     */

    async hset( key: string, field: string, value: string ): Promise<void> {

        await redisConnection.hset( key, field, value );

    }

    async hgetall( key: string ): Promise<Record<string, string>> {

        return redisConnection.hgetall(key);

    }

    async hdel( key: string, field: string ): Promise<void> {

        await redisConnection.hdel( key, field );

    }

}