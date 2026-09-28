// src/infrastructure/database/repositories/EspecialidadeRepository.ts

import { Transaction } from 'sequelize';
import { EspecialidadeModel } from '../models/especialidade.model'; 
import { IEspecialidadeRepository } from '../../../domain/repositories/IEspecialidadeRepository'; 
import { EspecialidadeEntity } from '../../../domain/entities/EspecialidadeEntity'; 
import { EspecialidadeMapper } from '../mappers/EspecialidadeMapper';

export class EspecialidadeRepository implements IEspecialidadeRepository {
    
    // Injeção do Model Sequelize
    constructor(private especialidadeModel: typeof EspecialidadeModel) {
       
    } 
    
    // ------------------------------------------
    // MÉTODOS CRUD
    // ------------------------------------------

    async buscarPorId(id: number): Promise<EspecialidadeEntity | null> {
        const record = await this.especialidadeModel.findByPk(id);

        if (!record) {
            return null; 
        }
        
        return EspecialidadeMapper.toEntity(record); 
    }

    async buscarPorNome(nome: string): Promise<EspecialidadeEntity | null> {
        const record = await this.especialidadeModel.findOne({ where: { nome } });

        if (!record) {
            return null; 
        }
        
        return EspecialidadeMapper.toEntity(record); 
    }

    async criar(nome: string, transaction?: Transaction): Promise<EspecialidadeEntity> {
        const record = await this.especialidadeModel.create(
            { nome }, 
            { transaction }
        );

        return EspecialidadeMapper.toEntity(record);
    }

    // ------------------------------------------
    // LÓGICA DE NEGÓCIO (UTILITÁRIO)
    // ------------------------------------------

     async criarIfNotExists(nome: string, transaction?: Transaction): Promise<EspecialidadeEntity> {
        // 1. Tenta buscar a especialidade pelo nome
        let especialidade = await this.buscarPorNome(nome);
        
        // 2. Se não existir, cria uma nova
        if (!especialidade) {
            especialidade = await this.criar(nome, transaction);
        }
        
        // 3. Retorna a especialidade existente ou recém-criada
        return especialidade;
    }

    async listarTodas(): Promise<EspecialidadeEntity[]> {
        const records = await this.especialidadeModel.findAll({
            order: [['nome', 'ASC']] // Ordenado para facilitar a vida do usuário no front
        });

        return records.map(record => EspecialidadeMapper.toEntity(record));
    }


    // ------------------------------------------
    // MÉTODOS TRANSACIONAIS
    // ------------------------------------------

    async iniciarTransacao(): Promise<Transaction> {
        return await this.especialidadeModel.sequelize!.transaction();
    }

    async commit(transaction: Transaction): Promise<void> {
        await transaction.commit();
    }

    async rollback(transaction: Transaction): Promise<void> {
        await transaction.rollback();
    }
}