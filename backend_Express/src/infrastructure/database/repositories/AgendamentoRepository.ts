// src/infrastructure/database/repositories/AgendamentoRepository.ts

import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { AgendamentoEntity } from '../../../domain/entities/AgendamentoEntity';
import { AgendamentoModel } from '../models/agendamento.model';
import { AgendamentoMapper } from '../mappers/AgendamentoMapper';
import { Op } from 'sequelize';
import AppError from '../../../application/errors/AppError';

export class AgendamentoRepository implements IAgendamentoRepository {


    constructor(private model: typeof AgendamentoModel) { }

    async criar(agendamento: AgendamentoEntity): Promise<AgendamentoEntity> {
        // Usa o Mapper para converter a Entity rica em um objeto simples para o Sequelize
        const data = AgendamentoMapper.toPersistence(agendamento);

        const criado = await this.model.create(data);

        return AgendamentoMapper.toDomain(criado);
    }

    async buscarPorPeriodo(profissionalId: number, inicio: Date, fim: Date): Promise<AgendamentoEntity[]> {

        const dataFimLimite = new Date(fim);
        dataFimLimite.setUTCHours(23, 59, 59, 999);

        const registros = await this.model.findAll({
            where: {
                profissional_id: profissionalId,
                status: { [Op.ne]: 'cancelado' },
                // Lógica de Sobreposição (Overlap)
                [Op.and]: [
                    { data_inicio: { [Op.lte]: dataFimLimite } },
                    { data_fim: { [Op.gte]: inicio } }
                ]
            },
            include: [{
                association: 'paciente',
                attributes: ['codinome']
            }]
        });

        return registros.map(AgendamentoMapper.toDomain);
    }

    async verificarConflito(profissionalId: number, inicio: Date, fim: Date): Promise<boolean> {
        const conflito = await this.model.findOne({
            where: {
                profissional_id: profissionalId,
                status: { [Op.in]: ['pendente', 'confirmado'] },
                data_inicio: { [Op.lt]: fim },
                data_fim: { [Op.gt]: inicio }
            }
        });
        return !!conflito;
    }

    async buscarPorId(id: number): Promise<AgendamentoEntity | null> {
        const registro = await this.model.findByPk(id);
        return registro ? AgendamentoMapper.toDomain(registro) : null;
    }

    async atualizar(agendamento: AgendamentoEntity): Promise<AgendamentoEntity> {
        const data = AgendamentoMapper.toPersistence(agendamento);
        await this.model.update(data, {
            where: { id: agendamento.id }
        });

        const atualizado = await this.buscarPorId(agendamento.id!);

        if (!atualizado) {
            throw new AppError(`Agendamento ${agendamento.id} não encontrado após atualização.`);
        }

        return atualizado
    }

    async countAgendamentos(): Promise<number> {

        return await this.model.count({
            where: {
                status: { [Op.ne]: 'cancelado' }
            }
        }
        );
    }

    async countAgendamentosPorMes(meses: number): Promise<{ mes: string; total: number; }[]> {
        const dataLimite = new Date();
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - meses);
        dataInicio.setUTCHours(0, 0, 0, 0);

        const registros = await this.model.findAll({
            attributes: [
                [this.model.sequelize!.fn('TO_CHAR', this.model.sequelize!.col('data_inicio'), 'YYYY-MM'), 'mes'],
                [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'total']
            ],
            where: {
                data_inicio: {
                    [Op.gte]: dataInicio,
                    [Op.lte]: dataLimite
                },
                status: { [Op.ne]: 'cancelado' }
            },
            group: ['mes'],
            order: [[this.model.sequelize!.col('mes'), 'ASC']],
        });

        return registros.map((registro: any) => ({
            mes: registro.getDataValue('mes'),
            total: parseInt(registro.getDataValue('total'))
        }));
    }



    async countPorPeriodo(profissionalId: number, inicio: Date, fim: Date): Promise<number> {
        return await this.model.count({
            where: {
                profissional_id: profissionalId,
                status: { [Op.ne]: 'cancelado' },
                data_inicio: {
                    [Op.gte]: inicio,
                    [Op.lte]: fim
                }
            }
        });
    }

    async distribuicaoMensalProfissional(profissionalId: number, meses: number): Promise<{ mes: string; total: number; }[]> {
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - meses);
        dataInicio.setUTCHours(0, 0, 0, 0);

        const registros = await this.model.findAll({
            attributes: [
                [this.model.sequelize!.fn('TO_CHAR', this.model.sequelize!.col('data_inicio'), 'YYYY-MM'), 'mes'],
                [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'total']
            ],
            where: {
                profissional_id: profissionalId,
                data_inicio: { [Op.gte]: dataInicio },
                status: { [Op.ne]: 'cancelado' }
            },
            group: ['mes'],
            order: [[this.model.sequelize!.col('mes'), 'ASC']],
        });

        return registros.map((r: any) => ({
            mes: r.getDataValue('mes'),
            total: parseInt(r.getDataValue('total'))
        }));
    }
}