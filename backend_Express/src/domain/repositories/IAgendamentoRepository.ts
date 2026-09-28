// src/domain/repositories/IAgendamentoRepository.ts

import { AgendamentoEntity } from '../entities/AgendamentoEntity';

export interface IAgendamentoRepository {
    criar(agendamento: AgendamentoEntity): Promise<AgendamentoEntity>;

    buscarPorPeriodo(
        profissionalId: number,
        inicio: Date,
        fim: Date
    ): Promise<AgendamentoEntity[]>;

    verificarConflito(
        profissionalId: number,
        inicio: Date,
        fim: Date
    ): Promise<boolean>;

    atualizar(agendamento: AgendamentoEntity): Promise<AgendamentoEntity>;

    buscarPorId(id: number): Promise<AgendamentoEntity | null>;

    countAgendamentos(): Promise<number>;

    // Método para agrupar agendamentos por x meses, retornando a contagem de cada mês
    countAgendamentosPorMes(meses: number): Promise<{ mes: string, total: number }[]>;

    // Retorna apenas a contagem numérica de agendamentos em um período para um profissional específico
    countPorPeriodo(
        profissionalId: number,
        inicio: Date,
        fim: Date
    ): Promise<number>;

    // Retorna a distribuição mensal de agendamentos de um profissional específico para o gráfico
    distribuicaoMensalProfissional(
        profissionalId: number,
        meses: number
    ): Promise<{ mes: string, total: number }[]>;

}