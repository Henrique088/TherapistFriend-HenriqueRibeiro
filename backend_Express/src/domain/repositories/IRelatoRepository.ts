// src/domain/repositories/IRelatoRepository.ts

import { Transaction } from 'sequelize';
import { RelatoEntity} from '../entities/RelatoEntity';

interface RelatoNotificacaoDTO {
    id: number;
    paciente_id: number;
    titulo: string;
    codinomePaciente: string;
    nomeProfissional: string;
}

export interface IRelatoRepository {

    criar(relato: RelatoEntity): Promise<RelatoEntity>;

    buscarPorId(id: number): Promise<RelatoEntity | null>;
    
    // Paginação: retorna os dados e o total para o front saber quantas páginas existem
    listarDisponiveis(profissionalId: number, page: number, limit: number, filtros: {gravidade?: string[], busca?: string}): Promise<{
        dados: RelatoEntity[],
        total: number
    }>;

    vincularProfissional(relatoId: number, profissionalId: number): Promise<void>;

    registrarRecusa(relatoId: number, profissionalId: number): Promise<void>;

    atualizarResultadoIA(relatoId: number, resultado: string): Promise<void>;
    
    //  Para o paciente ver o histórico dele
    listarPorPaciente(pacienteId: number, page: number, limit: number): Promise<{
        dados: RelatoEntity[],
        total: number
    }>;

    confirmarVinculo(relatoId: number, profissionalId: number, transaction?: Transaction): Promise<RelatoEntity>;

    listarRelatosparaPaciente(pacienteId: number, page: number, limit: number, filtros: {busca?: string }): Promise<{dados:RelatoEntity[], total:number}>;


    buscarDadosParaNotificacao(relatoId: number): Promise<RelatoNotificacaoDTO | null>;

    deletarRelato(usuarioId: number,relatoId: number): Promise<void>;

    atualizarRelato(relato: RelatoEntity, transaction?: Transaction): Promise<RelatoEntity>;

    countRelatos(): Promise<number>;


    iniciarTransacao(): Promise<Transaction>;

    commit(transaction: Transaction): Promise<void>;
    
    rollback(transaction: Transaction): Promise<void>;
}