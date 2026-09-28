// src/domain/repositories/ISessionRepository.ts

import { SessionEntity } from "../entities/SessionEntity";

export interface ISessionRepository {

    create(session: SessionEntity): Promise<SessionEntity>;

    findById(id: number): Promise<SessionEntity | null>;

    updateStatus(
        id: number,
        status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada',
        started_at?: Date | null,
        ended_at?: Date | null
    ): Promise<void>;
}