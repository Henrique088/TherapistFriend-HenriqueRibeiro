// src/domain/services/ISessionRuntimeService.ts

import { ParticipantPresence } from "../entities/ParticipantPresence";

export interface ISessionRuntimeService {

    registerCredential(
        sessaoId: string,
        userId: number
    ): Promise<void>;

    isRegistered(
        sessaoId: string,
        userId: number
    ): Promise<boolean>;

    registerPresence(
        sessaoId: string,
        usuarioId: number
    ): Promise<void>;

    updateHeartbeat(
        sessaoId: string,
        usuarioId: number
    ): Promise<void>;

    markOffline(
        sessaoId: string,
        usuarioId: number
    ): Promise<void>;

    getParticipantPresence(
        sessaoId: string,
        usuarioId: number
    ): Promise<ParticipantPresence | null>;

    getPresence(
        sessaoId: string
    ): Promise<ParticipantPresence[]>;

    markSessionStarted(
        sessaoId: string
    ): Promise<void>;

    isSessionActive(
        sessaoId: string
    ): Promise<boolean>;

    invalidateSession(
        sessaoId: string
    ): Promise<void>;

    registerActiveSession(
        sessaoId: string
    ): Promise<void>;

    removeActiveSession(
        sessaoId: string
    ): Promise<void>;

    getActiveSessions(): Promise<string[]>;

}