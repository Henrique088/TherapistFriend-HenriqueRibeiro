import { ProfissionalEspecialidadeEntity } from '../entities/ProfissionalEspecialidadeEntity';

export interface IProfissionalEspecialidadeRepository {
    
    /**
     * Cria um novo vínculo entre um profissional e uma especialidade usando a Entity.
     * @param vinculo Instância da entidade de domínio.
     * @param transaction Objeto de transação do ORM (opcional).
     */
    // vincular(vinculo: ProfissionalEspecialidadeEntity, transaction?: any): Promise<ProfissionalEspecialidadeEntity>;

    vincular(idProfissional: number, idEspecialidade: number, transaction?: any): Promise<ProfissionalEspecialidadeEntity>;


    /**
     * Remove o vínculo específico.
     * @param idProfissional ID do Profissional.
     * @param idEspecialidade ID da Especialidade.
     */
    removerVinculo(idProfissional: number, idEspecialidade: number, transaction?: any): Promise<void>;

    /**
     * Busca todos os vínculos de um profissional específico.
     * Útil para sincronização ou auditoria.
     */
    buscarPorProfissional(idProfissional: number): Promise<ProfissionalEspecialidadeEntity[]>;
    
    // MÉTODOS TRANSACIONAIS
    iniciarTransacao(): Promise<any>;

    commit(transaction: any): Promise<void>;
    
    rollback(transaction: any): Promise<void>;
}