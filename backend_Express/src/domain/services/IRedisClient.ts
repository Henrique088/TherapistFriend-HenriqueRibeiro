// src/domain/services/IRedisClient.ts

export interface IRedisClient {

    get(key: string): Promise<string | null>;

    set(key: string, value: string, ttlSeconds?: number): Promise<void>;

    del(...keys: string[]): Promise<void>;

    exists(key: string): Promise<boolean>;

    acquireLock(key: string, ttlSeconds: number): Promise<boolean>;

    releaseLock(key: string): Promise<void>;

    expire(key: string, ttlSeconds: number): Promise<void>;

    ttl(key: string): Promise<number>;

    /**
     * ==========================
     * Sets
     * ==========================
     */

    sadd(key: string, ...values: string[]): Promise<void>;

    srem(key: string, ...values: string[]): Promise<void>;

    smembers(key: string): Promise<string[]>;

    sismember(key: string, value: string): Promise<boolean>;

    scard(key: string): Promise<number>;

    /**
     * ==========================
     * Busca por padrão
     * ==========================
     */

    keys(pattern: string): Promise<string[]>;


    /**
    * ==========================
    * Hashes
    * ==========================
    */

    hset(
        key: string,
        field: string,
        value: string
    ): Promise<void>;

    hgetall(
        key: string
    ): Promise<Record<string, string>>;

    hdel(
        key: string,
        field: string
    ): Promise<void>;
}