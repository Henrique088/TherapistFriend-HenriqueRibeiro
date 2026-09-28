// src/domain/entities/SessaoEntity.ts

import { v4 as uuidv4 } from 'uuid';
import AppError from '../../application/errors/AppError';

export type SessaoStatus = 'agendada' | 'ativa' | 'finalizada' | 'cancelada';

export interface SessaoProps {
    id?: string;
    paciente_id: number;
    profissional_id: number;
    agendamento_id?: number;
    status: SessaoStatus;
    data_inicio: Date;
    data_fim?: Date | null;
    data_inicio_real?: Date | null;
}

export type SessaoPersistenceData = {
    id: string;
    paciente_id: number;
    profissional_id: number;
    agendamento_id: number | null;
    status: SessaoStatus;
    data_inicio: Date;
    data_fim: Date | null;
    data_inicio_real: Date | null
}

export class SessaoEntity {
    // private _id!: string; // Assertion: sempre terá valor após construção
    constructor(public readonly props: SessaoProps) {
        // Gera UUID automaticamente se não for fornecido
        if (!this.props.id) {
            this.props.id = uuidv4();
        }

        if (this.props.paciente_id === this.props.profissional_id) {
            throw new AppError("Paciente e profissional não podem ser a mesma pessoa.");
        }
    }

    // Getters
    public get id(): string { return this.props.id!; }
    public get paciente_id() { return this.props.paciente_id; }
    public get profissional_id() { return this.props.profissional_id; }
    public get agendamento_id() { return this.props.agendamento_id; }
    public get status() { return this.props.status; }
    public get data_inicio() { return this.props.data_inicio; }
    public get data_fim() { return this.props.data_fim; }
    public get data_inicio_real() { return this.props.data_inicio_real; }



    // Regras de Negócio

    /**
     * Verifica se a sessão pode ser finalizada.
     * Somente sessões 'ativas' podem passar para 'finalizada'.
     */
    public finalizar(dataEncerramento: Date): void {
        if (this.props.status !== 'ativa') {
            throw new AppError(`Não é possível finalizar uma sessão com status: ${this.props.status}`);
        }

        this.props.status = 'finalizada';
        this.props.data_fim = dataEncerramento;
    }

    public get persistenceData(): Required<SessaoPersistenceData> {
        return {
            id: this.id,
            paciente_id: this.props.paciente_id,
            profissional_id: this.props.profissional_id,
            agendamento_id: this.props.agendamento_id ?? null,
            status: this.props.status,
            data_inicio: this.props.data_inicio,
            data_fim: this.props.data_fim ?? null,
            data_inicio_real: this.props.data_inicio_real ?? null
        };
    }

    // /**
    //  * Define os dados de análise vindos do Microserviço.
    //  * Geralmente chamado pelo Handler após o processamento do BullMQ.
    //  */
    // public setDadosAnalise(dados: any): void {
    //     if (this.props.status !== 'finalizada') {
    //         throw new Error("A análise só pode ser atribuída a uma sessão já finalizada.");
    //     }
    //     this.props.dados_analise = dados;
    // }

    /**
     * Retorna o horário para envio do lembrete (10 minutos antes)
     * REGRA DE NEGÓCIO: Lembretes são enviados 10 minutos antes
     */
    public getHorarioLembrete(): Date {
        return new Date(this.props.data_inicio.getTime() - (10 * 60 * 1000));
    }

    /**
     * Retorna o link da sala de espera
     * REGRA DE NEGÓCIO: Formato do link segue padrão da plataforma
     */
    public getLinkSalaEspera(): string {
        return `/sala/${this.props.id}`;
    }

    /**
     * Verifica se o relatório pode ser exibido.
     * Regra: Somente o profissional visualiza e a sessão deve estar finalizada.
     */
    public podeExibirRelatorio(usuarioId: number, tipoUsuario: string): boolean {
        if (tipoUsuario === 'profissional' && this.props.profissional_id === usuarioId && this.props.status === 'finalizada') {
            return true
        }
        throw new AppError('Acesso negado ou sessão inválida para relatório.', 403);
    }

    /**
     * Verifica se a sessão ocorreu em tempo suficiente para gerar relatório.
     * Regra: Tempo minimo de 10minutos
     */

    public verficiarTempoRelatorio(): boolean {
        const agora = new Date().getTime();
        let duracao = 0

        if (this.data_inicio_real) {
            duracao = this.data_inicio_real.getTime() - agora;

        } else {
            duracao = this.data_inicio.getTime() - agora;
        }

        // if (duracao <= 15) {
        //     throw new AppError("Duração da sessão foi insuficiente para gerar relátorio");
        // }

        return duracao > 15;
    }

    /**
     * Inicia a chamada (transição de agendada para ativa)
     */
    public iniciarSessao(): void {
        if (this.props.status === 'ativa') {
            return;
        }
        if (this.props.status !== 'agendada') {
            throw new AppError("Somente sessões agendadas podem ser iniciadas.");
        }
        this.props.status = 'ativa';
        this.props.data_inicio_real = new Date();
    }

    public toJSON(): SessaoProps {
        return { ...this.props };
    }
}