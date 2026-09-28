// src/domain/entities/BloqueioEntity.ts

import AppError from "../../application/errors/AppError";
import { BloqueioExcecaoEntity } from "./BloqueioExcecaoEntity";


export interface BloqueioProps {
    id?: number;
    profissionalId: number;
    titulo: string;
    dataInicio: Date;
    dataFim: Date;
    recorrente: boolean;
    tipo?: 'comum' | 'estrategico' | 'pessoal' | 'feriado';
    diasSemana: number[];
    ativo: boolean;
    excecoes?: BloqueioExcecaoEntity[];
}

export class BloqueioEntity {
    private props: BloqueioProps;

    constructor(props: BloqueioProps) {
        if (props.dataFim <= props.dataInicio) {
            throw new AppError("A data de fim do bloqueio deve ser posterior ao início.");
        }

        if (props.recorrente && !props.diasSemana) {
            throw new AppError("Um bloqueio recorrente deve possuir ao menos um dia da semana selecionado.");
        }

        this.props = {
            ...props,
            ativo: props.ativo ?? true,
            recorrente: props.recorrente ?? false,
            excecoes: props.excecoes || []
        };
    }

    // ... Getters (id, profissionalId, titulo, etc.) ...
    get id(): number | undefined { return this.props.id; }
    get profissionalId(): number { return this.props.profissionalId; }
    get titulo(): string { return this.props.titulo; }
    get dataInicio(): Date { return this.props.dataInicio; }
    get dataFim(): Date { return this.props.dataFim; }
    get recorrente(): boolean { return this.props.recorrente; }
    get tipo(): string | undefined { return this.props.tipo; }
    get diasSemana(): number[] | undefined { return this.props.diasSemana; }
    get ativo(): boolean { return this.props.ativo; }
    get excecoes(): BloqueioExcecaoEntity[] { return this.props.excecoes || []; }

    /**
     * REGRA DE NEGÓCIO: Verifica se o bloqueio deve ser aplicado em uma data específica.
     * Um bloqueio está ativo se:
     * 1. A propriedade 'ativo' for verdadeira.
     * 2. Não existir uma exceção cadastrada para a data informada.
     */

    estaAtivoParaData(data: Date): boolean {
    if (!this.ativo) return false;

    // Normaliza para comparação de dia (sem horas)
    const dataAlvoZerada = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
    const dataInicioZerada = new Date(Date.UTC(this.dataInicio.getUTCFullYear(), this.dataInicio.getUTCMonth(), this.dataInicio.getUTCDate()));

    // 1. Verifica Exceções
    const dataIso = dataAlvoZerada.toISOString().split('T')[0];
    const temExcecao = this.excecoes?.some(exc =>
        new Date(exc.dataExcecao).toISOString().split('T')[0] === dataIso
    );
    if (temExcecao) return false;

    // 2. Verifica Recorrência
    if (this.recorrente && this.diasSemana) {
        const diaDaSemana = data.getUTCDay();
        return this.diasSemana.includes(diaDaSemana) && dataAlvoZerada >= dataInicioZerada;
    }

    // 3. Pontual
    return data >= this.dataInicio && data <= this.dataFim;
}

    public permitePrioridade(): boolean {
        return this.props.tipo === 'estrategico' && this.ativo;
    }

    public desativar(): void {
        this.props.ativo = false;
    }

    public adicionarExcecao(excecao: BloqueioExcecaoEntity): void {
        this.props.excecoes?.push(excecao);
    }
}