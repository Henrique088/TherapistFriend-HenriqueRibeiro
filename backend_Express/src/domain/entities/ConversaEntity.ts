// src/domain/entities/ConversaEntity.ts

export interface ConversaProps {
    id?: number;
    relato_id_origem: number | null;
    pacienteId: number;
    profissionalId: number;
    pacienteCodinome?: string; 
    profissionalNome?: string;
    status: 'ativa' | 'encerrada';
    createdAt?: Date;
}

export class ConversaEntity {
    constructor(public readonly props: ConversaProps) {}

    get id() { return this.props.id; }
    get relato_id_origem() { return this.props.relato_id_origem; }
    get pacienteId() { return this.props.pacienteId; }
    get profissionalId() { return this.props.profissionalId; }
    get status() { return this.props.status; }


    getDestinatarioId(remetenteId: number): number {
    return this.props.pacienteId === remetenteId 
        ? this.props.profissionalId 
        : this.props.pacienteId;
}
}