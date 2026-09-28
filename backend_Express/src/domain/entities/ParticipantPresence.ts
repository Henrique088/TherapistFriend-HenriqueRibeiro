// src/domain/entities/ParticipantPresence.ts

export interface ParticipantPresence {

    usuarioId: number;

    online: boolean;

    heartbeat: number;

}