// src/infrastructure/database/repositories/DisponibilidadeRepository.ts

import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { DisponibilidadeEntity } from '../../../domain/entities/DisponibilidadeEntity';
import { DisponibilidadeModel } from '../models/disponibilidade-profissional.model';
import { DisponibilidadeMapper } from '../mappers/DisponibilidadeMapper';

export class DisponibilidadeRepository implements IDisponibilidadeRepository {

    constructor(private model: typeof DisponibilidadeModel) { }

    async substituirGrade(profissionalId: number, disponibilidades: DisponibilidadeEntity[]): Promise<void> {
        // Usa uma transação para garantir que o profissional não fique sem grade se algo falhar
        const transaction = await this.model.sequelize?.transaction();

        try {
            // Remove a grade antiga
            await this.model.destroy({
                where: { profissional_id: profissionalId },
                transaction
            });

            // 2. Prepara os novos dados
            const dados = disponibilidades.map(DisponibilidadeMapper.toPersistence);

            // 3. Insere a nova grade
            await this.model.bulkCreate(dados as any, { transaction });

            await transaction?.commit();
        } catch (error) {
            await transaction?.rollback();
            throw error;
        }
    }

    async buscarPorDiaSemana(profissionalId: number, diaSemana: number): Promise<DisponibilidadeEntity[]> {
        const registros = await this.model.findAll({
            where: {
                profissional_id: profissionalId,
                dia_semana: diaSemana,
                ativo: true
            },
            order: [['hora_inicio', 'ASC']]
        });

        return registros.map(DisponibilidadeMapper.toDomain);
    }

    async listarGradeCompleta(profissionalId: number): Promise<DisponibilidadeEntity[]> {
        const registros = await this.model.findAll({
            where: { profissional_id: profissionalId },
            order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']]
        });

        return registros.map(DisponibilidadeMapper.toDomain);
    }
}