// src/domain/repositories/IProfissionalRepository.ts

import { ProfissionalEntity } from '../entities/ProfissionalEntity';

// DTO para busca avançada com filtros (data transfer object)
export interface ProfissionalFiltroDTO {
    pagina: number;
    limite: number;
    nome?: string;          // Filtro por nome do Usuário associado
    especialidade?: string; // Filtro por nome da Especialidade associada
}


export interface IProfissionalRepository {

    // ------------------------------------------
    // CRUD BÁSICO
    // ------------------------------------------

    /** * Cria um novo registro de Profissional.
     * @param dados Dados de criação (geralmente DTO).
     * @param transaction Objeto de transação (tipo 'any' para não vazar a dependência do ORM).
     */
    criar(dados: any, transaction?: any): Promise<ProfissionalEntity>;

    /** Busca um Profissional pelo seu ID principal (chave primária). */
    buscarPorUsuarioId(id: number): Promise<ProfissionalEntity | null>;

    /** * Busca um Profissional pela chave estrangeira (ID do Usuário).
     * @param idUsuario ID do registro na tabela Usuario.
     */
    buscarPorUsuario(idUsuario: number): Promise<ProfissionalEntity | null>;



    // No IProfissionalRepository.ts
    /** * Atualiza os dados de um Profissional a partir da sua entidade.
     * @param profissional Instância da entidade com os dados atualizados.
     * @param options Objeto contendo transação ou outras configurações.
     */
    atualizar(profissional: ProfissionalEntity, options?: { transaction?: any }): Promise<void>;

    /** * Vincula especialidades a um profissional.
     * @param profissionalId ID do Profissional.
     * @param especialidadesIds Array de IDs das Especialidades a serem vinculadas.
     * @param transaction Objeto de transação (tipo 'any' para não vazar a dependência do ORM).
     */
    vincularEspecialidades(profissionalId: number, especialidadesIds: number[], transaction?: any): Promise<void>;

    // ------------------------------------------
    // CONSULTAS AVANÇADAS
    // ------------------------------------------

    /**
     * Busca profissionais com paginação e filtros complexos (nome, especialidade).
     * @param filtros Objeto contendo paginação e critérios de busca.
     */
    buscarComFiltros(filtros: ProfissionalFiltroDTO): Promise<{
        data: ProfissionalEntity[];
        total: number;
        pagina: number;
        totalPaginas: number;
    }>;

    validarProfissional(profissional: ProfissionalEntity): Promise<void>;

    listarProfissionaisParaAdmin(page: number, limit: number, filtro?:{busca?: string, status?: string}): Promise<{dados: ProfissionalEntity[], total: number, pagina: number, totalPaginas: number}>;

    buscarPorUsuarioComHistorico(idUsuario: number): Promise<ProfissionalEntity | null>;
    // ------------------------------------------
    // MÉTODOS TRANSACIONAIS
    // ------------------------------------------

    /** Inicia uma nova transação de banco de dados. Retorna o objeto de transação (opaco ao domínio). */
    iniciarTransacao(): Promise<any>;

    /** Confirma as operações na transação. */
    commit(transaction: any): Promise<void>;

    /** Desfaz as operações na transação. */
    rollback(transaction: any): Promise<void>;
}