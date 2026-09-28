// src/domain/repositories/IEspecialidadeRepository.ts

import { EspecialidadeEntity } from '../entities/EspecialidadeEntity'; 

/**
 * Interface que define o contrato para o Repositório de Especialidades.
 * Lida com a persistência e recuperação da EspecialidadeEntity.
 */
export interface IEspecialidadeRepository {
    
    // CRUD BÁSICO
    
    /** Busca uma Especialidade pelo seu ID. */
    buscarPorId(id: number): Promise<EspecialidadeEntity | null>;

    /** Busca uma Especialidade pelo nome. */
    buscarPorNome(nome: string): Promise<EspecialidadeEntity | null>;

    /** Cria um novo registro de Especialidade. */
    criar(nome: string, transaction?: any): Promise<EspecialidadeEntity>;

    listarTodas() :Promise<EspecialidadeEntity[]>
    
    // LÓGICA DE NEGÓCIO (UTILITÁRIO)
    
    /**
     * Busca uma especialidade pelo nome; se não existir, cria uma nova.
     * @returns A entidade de Especialidade existente ou a recém-criada.
     */
    criarIfNotExists(nome: string, transaction?: any): Promise<EspecialidadeEntity>;

    // MÉTODOS TRANSACIONAIS (Usando 'any' para evitar vazamento do ORM)

    iniciarTransacao(): Promise<any>;

    commit(transaction: any): Promise<void>;
    
    rollback(transaction: any): Promise<void>;
}