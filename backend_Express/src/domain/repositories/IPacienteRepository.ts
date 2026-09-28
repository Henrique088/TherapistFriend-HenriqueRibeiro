// src/domain/interfaces/IPacienteRepository.ts

import { PacienteEntity } from '../entities/PacienteEntity';


export interface IPacienteRepository {
    // Retorna a entidade Paciente criada (ou a versão JSON/DTO, dependendo da sua regra)
    criar(dados: { idUsuario: number; codinome: string | null;}, transaction?: any): Promise<PacienteEntity>;
    
    buscarPorId(id: number): Promise<PacienteEntity | null>;
    
    // O método 'salvar' é geralmente um 'update' ou 'upsert'
    salvar(paciente: PacienteEntity, transaction?: any): Promise<void>; 
    
    // Busca um Paciente pelo ID do Usuário associado
    buscarPorUsuarioId(idUsuario: number): Promise<PacienteEntity | null>;

    buscarPorCodinome(codinome: string): Promise<Boolean | null>;

    listarPacienteParaAdmin(page: number, limit: number, filtro?:{busca?: string, status?: string}): Promise<{dados: PacienteEntity[], total: number, pagina: number, totalPaginas: number}>;

    iniciarTransacao(): Promise<any>;

    commit(transaction: any): Promise<void>;
    
    rollback(transaction: any): Promise<void>;
}