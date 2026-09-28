// src/infrastructure/database/repositories/ProfissionalEspecialidadeRepository.ts

import { Transaction } from 'sequelize';
import { ProfissionalEspecialidadeModel, ProfissionalEspecialidadeAttributes } from '../models/profissional_especialidade.model'; 
import { IProfissionalEspecialidadeRepository } from '../../../domain/repositories/IProfissionalEspecialidadeRepository'; 
import { ProfissionalEspecialidadeEntity } from '../../../domain/entities/ProfissionalEspecialidadeEntity';
import { ProfissionalEspecialidadeMapper } from '../mappers/ProfissionalEspecialidadeMapper';
import AppError from '../../../application/errors/AppError';

export class ProfissionalEspecialidadeRepository implements IProfissionalEspecialidadeRepository {
    
    private ModelProfissionalEspecialidade: typeof ProfissionalEspecialidadeModel;

    constructor(ModelProfissionalEspecialidade: typeof ProfissionalEspecialidadeModel) {
        this.ModelProfissionalEspecialidade = ModelProfissionalEspecialidade;
    }

    // ------------------------------------------
    // VÍNCULOS
    // ------------------------------------------

    /**
     * Cria um novo vínculo e retorna a Entidade de Domínio.
     */
    async vincular(
        idProfissional: number, 
        idEspecialidade: number, 
        options: { transaction?: Transaction } = {}
    ): Promise<ProfissionalEspecialidadeEntity> {
        
        const data: Omit<ProfissionalEspecialidadeAttributes, 'id'> = {
            profissional_id: idProfissional,
            especialidade_id: idEspecialidade
        };

        const record = await this.ModelProfissionalEspecialidade.create(data as any, options);
        
        return ProfissionalEspecialidadeMapper.toEntity(record);
    }

    /**
     * Remove um vínculo. Retorna o número de linhas afetadas.
     */
    async removerVinculo(
        idProfissional: number, 
        idEspecialidade: number, 
        options: { transaction?: Transaction } = {}
    ): Promise<void> {
        
        const rowsAffected = await this.ModelProfissionalEspecialidade.destroy({
            where: { 
                profissional_id: idProfissional, 
                especialidade_id: idEspecialidade 
            },
            ...options
        });
        
        if (rowsAffected === 0) {
            throw new AppError('Vínculo não encontrado para remoção.');
        }
    }

    /**
     * Busca todos os vínculos de um profissional específico.
     */
    async buscarPorProfissional(idProfissional: number): Promise<ProfissionalEspecialidadeEntity[]> {
        const records = await this.ModelProfissionalEspecialidade.findAll({
            where: { profissional_id: idProfissional }
        });

        return records.map(record => ProfissionalEspecialidadeMapper.toEntity(record));
    }
    
    // ------------------------------------------
    // MÉTODOS TRANSACIONAIS
    // ------------------------------------------
    
    async iniciarTransacao(): Promise<Transaction> {
        const sequelizeInstance = this.ModelProfissionalEspecialidade.sequelize;
        if (!sequelizeInstance) {
            throw new AppError("Instância Sequelize não encontrada.");
        }
        return sequelizeInstance.transaction();
    }

    async commit(transaction: Transaction): Promise<void> { 
       await transaction.commit();
    }

    async rollback(transaction: Transaction): Promise<void> { 
       await transaction.rollback();
    }
}