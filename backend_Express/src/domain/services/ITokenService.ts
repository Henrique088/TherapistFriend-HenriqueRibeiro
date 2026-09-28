export type TokenType = | "access" | "refresh" | "signaling";

export interface SignalingTokenPayload {

    usuarioId: number;

    sessaoId: string;

    tipoUsuario: string;

    iat?: number;

    exp?: number;

}
export interface ITokenService {

    /**
     * Gera o Access Token da aplicação.
     */
    gerarAccessToken( payload: Record<string, any> ): string;

    /**
     * Gera o Refresh Token.
     */
    gerarRefreshToken( payload: Record<string, any> ): string;

    /**
     * Gera o JWT utilizado apenas
     * para autenticação do Socket.IO.
     */
    gerarSignalingToken( payload: Record<string, any> ): string;

    /**
     * Verifica qualquer tipo de JWT.
     */
    verificarToken<T = any>( token: string, tipo?: TokenType ): T;

    /**
     * Extrai o JTI do token.
     */
    extrairJti( token: string ): string;

    /**
     * Tempo de vida do Access Token.
     */
    getAccessTokenLifespan(): number;

    /**
     * Tempo de vida do Refresh Token.
     */
    getRefreshTokenLifespan(): number;

}