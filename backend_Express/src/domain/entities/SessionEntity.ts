// src/domain/entities/SessionEntity.ts

export type SessionStatus =
    | 'agendada'
    | 'em_andamento'
    | 'finalizada'
    | 'cancelada';

interface SessionConstructorParams {
    id?: number | null;
    paciente_id: number;
    profissional_id?: number | null;
    schedule_id: number;
    status?: SessionStatus;
    started_at?: Date | null;
    ended_at?: Date | null;
    created_at?: Date | null;
}

export interface ISessionData {
    id: number | null;
    paciente_id: number;
    profissional_id: number | null;
    schedule_id: number;
    status: SessionStatus;
    started_at: Date | null;
    ended_at: Date | null;
    created_at: Date | null;
}

export class SessionEntity {
    public readonly id: number | null;
    public paciente_id: number;
    public profissional_id: number | null;
    public schedule_id: number;
    public status: SessionStatus;
    public started_at: Date | null;
    public ended_at: Date | null;
    public created_at: Date | null;

    constructor({
        id = null,
        paciente_id,
        profissional_id = null,
        schedule_id,
        status = 'agendada',
        started_at = null,
        ended_at = null,
        created_at = null
    }: SessionConstructorParams) {
        this.id = id;
        this.paciente_id = paciente_id;
        this.profissional_id = profissional_id;
        this.schedule_id = schedule_id;
        this.status = status;
        this.started_at = started_at;
        this.ended_at = ended_at;
        this.created_at = created_at;
    }

    // Métodos de domínio (opcional, mas útil)

    public iniciar(): void {
        this.status = 'em_andamento';
        this.started_at = new Date();
    }

    public finalizar(): void {
        this.status = 'finalizada';
        this.ended_at = new Date();
    }

    public cancelar(): void {
        this.status = 'cancelada';
    }

    public toJSON(): ISessionData {
        return {
            id: this.id,
            paciente_id: this.paciente_id,
            profissional_id: this.profissional_id,
            schedule_id: this.schedule_id,
            status: this.status,
            started_at: this.started_at,
            ended_at: this.ended_at,
            created_at: this.created_at
        };
    }
}