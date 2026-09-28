// src/domain/entities/UrgenciaEntity.ts

import AppError from "../../application/errors/AppError";

export type JanelaTempo = '3_dias' | '7_dias';
export type UrgenciaStatus = 'pendente_aprovacao' | 'aprovada_aguardando_vaga' | 'rejeitada' | 'concluida';

export interface UrgenciaProps {
    id?: number;
    profissionalId: number;
    pacienteId: number;
    codinome?: string;
    motivo: string;
    janelaDeTempo: JanelaTempo;
    status: UrgenciaStatus;
    aprovadaEm?: Date;
    createdAt?: Date;
}

export class UrgenciaEntity {
    private props: UrgenciaProps;

    constructor(props: UrgenciaProps) {
        this.props = {
            ...props,
            status: props.status || 'pendente_aprovacao',
            aprovadaEm: props.aprovadaEm || new Date()
        };
    }

    // Getters
    get id() { return this.props.id; }
    get profissionalId() { return this.props.profissionalId; }
    get pacienteId() { return this.props.pacienteId; }
    get motivo() { return this.props.motivo; }
    get janelaDeTempo() { return this.props.janelaDeTempo; }
    get status() { return this.props.status; }
    get aprovadaEm() { return this.props.aprovadaEm; }
    get codinome() { return this.props.codinome; }

    /**
     * Aprova a solicitação de urgência e inicia o cronômetro da janela
     */
    aprovar(): void {
        if (this.props.status !== 'pendente_aprovacao') {
            throw new AppError("Apenas solicitações pendentes podem ser aprovadas.");
        }
        this.props.status = 'aprovada_aguardando_vaga';
        this.props.aprovadaEm = new Date();
    }

    /**
     * Rejeita a solicitação
     */
    rejeitar(): void {
        if (this.props.status !== 'pendente_aprovacao') {
            throw new AppError("Não é possível rejeitar uma solicitação já processada.");
        }
        this.props.status = 'rejeitada';
    }

    /**
     * Verifica se a janela de tempo (3 ou 7 dias) expirou
     */
    estaExpirada(): boolean {
        if (!this.props.aprovadaEm || this.props.status !== 'aprovada_aguardando_vaga') {
            return false;
        }

        const diasLimite = this.props.janelaDeTempo === '3_dias' ? 3 : 7;
        const dataExpiracao = new Date(this.props.aprovadaEm);
        dataExpiracao.setDate(dataExpiracao.getDate() + diasLimite);

        return new Date() > dataExpiracao;
    }

    verificar(): void {
        const sta = this.status === 'pendente_aprovacao' ? "em análise" : "aguardando vaga";
        throw new AppError(`Você já possui uma solicitação de urgência ${sta} com este profissional.`, 400);
    }

    /**
     * Finaliza a urgência quando o agendamento é realizado com sucesso
     */
    concluir(): void {
        if (this.props.status !== 'aprovada_aguardando_vaga') {
            throw new AppError("Apenas urgências aprovadas podem ser concluídas.");
        }
        this.props.status = 'concluida';
    }
}