// src/domain/repositories/IRefreshTokenRepository.ts

// DTO de entrada para salvar o token
export interface SalvarRefreshTokenDTO {
    user_id: number;
    token_hash: string;
    expires_at: Date;
    jti: string; // JWT ID para garantir unicidade
}

/**
 * Interface que define o contrato para o Repositório de Refresh Tokens.
 * Lida com a persistência e recuperação de tokens de longa duração.
 */
export interface IRefreshTokenRepository {
    
    /**
     * Salva o hash do Refresh Token no banco de dados.
     * @param dados Dados do token a ser salvo.
     * @returns Um objeto que representa o token salvo (pode ser void ou um ID).
     */
    salvarRefreshToken(dados: SalvarRefreshTokenDTO): Promise<any>;

    /**
     * Busca um Refresh Token ativo pelo seu hash ou ID (jti).
     * @param token Hash do token ou JTI.
     */
    buscarRefreshToken(token: string): Promise<any | null>;

    /**
     * Invalida ou deleta um Refresh Token do banco de dados (logout).
     * @param jti o ID do JWT.
     */
    invalidarRefreshToken(jti: string): Promise<void>;

    iniciarTransacao(): Promise<any>;

    commit(transaction: any): Promise<void>;
    
    rollback(transaction: any): Promise<void>;

    
}