// src/domain/services/ITurnSessionRepository.ts

export interface TurnSessionData {
    sessaoId: string;
    usuarioId: number;
    username: string;
    expiresAt: number;
    connected: boolean;
    connectedAt?: number;
}

export interface ITurnSessionRepository {
    
    salvarSessao(data: TurnSessionData): Promise<void>;

    buscarSessao( sessaoId: string, usuarioId: number ): Promise<TurnSessionData | null>;

    marcarComoConectado( sessaoId: string, usuarioId: number ): Promise<void>;

    removerSessao( sessaoId: string, usuarioId: number ): Promise<void>;
}