// src/domain/entities/AgendamentoEntity.ts

import AppError from "../../application/errors/AppError";

export type AgendamentoStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
export type AgendamentoTipo = 'regular' | 'urgencia';

export interface AgendamentoProps {
    id?: number;
    pacienteId: number;
    profissionalId: number;
    codinome?: string;
    dataInicio: Date;
    dataFim: Date;
    status: AgendamentoStatus;
    tipo: AgendamentoTipo;
    observacoes?: string;
    valor?: number;
}

export class AgendamentoEntity {
    private props: AgendamentoProps;

    constructor(props: AgendamentoProps) {
        this.validarDatas(props.dataInicio, props.dataFim);
        this.props = {
            ...props,
            status: props.status || 'pendente',
            tipo: props.tipo || 'regular'
        };
    }

    // Regra de Negócio: A data de fim nunca pode ser menor que a de início
    private validarDatas(inicio: Date, fim: Date) {
        if (fim <= inicio) {
            throw new Error("A data de término deve ser posterior à data de início.");
        }
    }

    // Getters para manter o encapsulamento
    get id(): number | undefined { return this.props.id; }
    get pacienteId(): number { return this.props.pacienteId; }
    get profissionalId(): number { return this.props.profissionalId; }
    get codinome(): string | undefined { return this.props.codinome; }
    get dataInicio(): Date { return this.props.dataInicio; }
    get dataFim(): Date { return this.props.dataFim; }
    get status(): AgendamentoStatus { return this.props.status; }
    get tipo(): AgendamentoTipo { return this.props.tipo; }
    get observacoes(): string | undefined { return this.props.observacoes; }
    get valor(): number | undefined { return this.props.valor; }

    // Regra de Negócio: Verificar se é um atendimento de urgência
    public ehUrgencia(): boolean {
        return this.props.tipo === 'urgencia';
    }

    // Método para atualizar status com validação
    public confirmar(): void {
        if (this.props.status === 'cancelado') {
            throw new AppError("Não é possível confirmar um agendamento cancelado.");
        }
        this.props.status = 'confirmado';
    }

    public responder(acao: 'confirmado' | 'cancelado'): void {
    if (this.props.status !== 'pendente') {
        throw new AppError(`Este agendamento já está ${this.props.status}.`);
    }
    this.props.status = acao;
}

public cancelarPeloPaciente(antecedenciaMinimaHoras: number = 24): void {
    const agora = new Date();
    const limite = new Date(this.props.dataInicio);
    limite.setHours(limite.getHours() - antecedenciaMinimaHoras);

    if (agora > limite) {
        throw new AppError(`Cancelamento permitido apenas com ${antecedenciaMinimaHoras}h de antecedência.`);
    }
    this.props.status = 'cancelado';
}

public verificaProfissional(profissionalId: number){
    if (profissionalId !== this.props.profissionalId) throw new AppError("Você não tem permissão para responder sessões de outro profissional");
}
}