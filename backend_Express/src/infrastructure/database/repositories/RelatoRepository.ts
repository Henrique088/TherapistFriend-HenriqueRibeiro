// src/infrastructure/repositories/RelatoRepository.ts

import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { RelatoEntity } from '../../../domain/entities/RelatoEntity';
import AppError from '../../../application/errors/AppError'
import { Op, Sequelize } from 'sequelize';
import { RelatoModelStatic } from '../models/relato.model';
import { Transaction } from 'sequelize';
import { RelatoMapper } from '../mappers/RelatoMapper';

interface RelatoNotificacaoDTO {
    id: number;
    paciente_id: number;
    titulo: string;
    codinomePaciente: string;
    nomeProfissional: string;
}

export class RelatoRepository implements IRelatoRepository {

    constructor(private model: RelatoModelStatic) { } 

    private getIncludeLikes(usuarioId: number) {
        return {
            attributes: {
                include: [
                    [Sequelize.literal(`(SELECT COUNT(*) FROM likes WHERE "relatoId" = "Relato".id)`), 'quantidadeLikes'] as any
                ]
            },
            include: [
                {
                    association: 'curtidas',
                    where: { id: usuarioId }, 
                    required: false, // Importante: Mantém o relato mesmo se não tiver like
                    attributes: ['id'],
                    through: { attributes: [] } // Limpa dados da tabela pivot
                },
                {
                    association: 'paciente',
                    attributes: ['id'],
                    include: [{ association: 'paciente', attributes: ['codinome'] }]
                }
            ]
        };
    }

    async criar(relato: RelatoEntity): Promise<RelatoEntity> {
        const dados = relato.toJSON();

        const novoRelato = await this.model.create(dados as any);
        return RelatoMapper.toEntity(novoRelato);
    }

    async buscarPorId(id: number): Promise<RelatoEntity | null> {
        const relato = await this.model.findByPk(id);
        return relato ? RelatoMapper.toEntity(relato) : null;
    }

    async vincularProfissional(relatoId: number, profissionalId: number): Promise<void> {
        const [rowsAffected] = await this.model.update(
            { profissional_id: profissionalId, status: 'aguardando_aprovacao' },
            { where: { id: relatoId, status: 'pendente' } }
        );

        if (rowsAffected === 0) {
            throw new AppError('Não foi possível assumir este relato. Ele pode já ter sido assumido ou não existe.', 400);
        }
    }

    async registrarRecusa(relatoId: number, profissionalId: number): Promise<void> {
        const relato = await this.model.findByPk(relatoId);

        if (relato) {
            const novosRecusados = Array.from(new Set([
                ...(relato.ids_profissionais_recusados || []),
                profissionalId
            ]));

            await relato.update({
                ids_profissionais_recusados: novosRecusados,
                profissional_id: null,
                status: 'pendente'
            }, {
                silent: false
            });
        }
    }

    async listarDisponiveis(profissionalId: number, page: number, limit: number, filtros: { gravidade?: string[], busca?: string }): Promise<{ dados: RelatoEntity[], total: number }> {
        const offset = (page - 1) * limit;
        const where: any = {
            ids_profissionais_recusados: {
                [Op.not]: {
                    [Op.contains]: [profissionalId]
                }
            }
        };

        if (filtros.gravidade && filtros.gravidade.length > 0) {
            const gravidades = Array.isArray(filtros.gravidade) ? filtros.gravidade : [filtros.gravidade];
            where.resultado_ia = { [Op.in]: gravidades };
        }

        if (filtros.busca) {
            where[Op.or] = [
                { titulo: { [Op.iLike]: `%${filtros.busca}%` } },
                { texto: { [Op.iLike]: `%${filtros.busca}%` } },
                { categoria: { [Op.iLike]: `%${filtros.busca}%` } },
                { status: { [Op.iLike]: `%${filtros.busca}%` } }
            ];
        }

        const queryOptions = this.getIncludeLikes(profissionalId);

        const { rows, count } = await this.model.findAndCountAll({
            where,
            limit,
            offset,
            order: [['data_envio', 'DESC']],
            ...queryOptions,
        });
        
        return { dados: rows.map((r: any) => RelatoMapper.toEntity(r)), total: count };
    }

    async atualizarResultadoIA(relatoId: number, resultado: string): Promise<void> {
        await this.model.update(
            { resultado_ia: resultado },
            { where: { id: relatoId } }
        );
    }

    async listarPorPaciente(pacienteId: number, page: number, limit: number): Promise<{ dados: RelatoEntity[]; total: number; }> {
        const offset = (page - 1) * limit;

        const { rows, count } = await this.model.findAndCountAll({
            where: {
                paciente_id: pacienteId
            },
            limit,
            offset,
            order: [['data_envio', 'DESC']]
        });

        return {
            dados: rows.map((r: any) => RelatoMapper.toEntity(r)),
            total: count
        };
    }

    async confirmarVinculo(relatoId: number, profissionalId: number, transaction?: any ): Promise<RelatoEntity> {
        const [rowsAffected] = await this.model.update(
            { status: 'em_conversa' },
            {
                where: {
                    id: relatoId,
                    profissional_id: profissionalId,
                    status: 'aguardando_aprovacao'
                },
                transaction: transaction
            }
        );

        if (rowsAffected === 0) {
            throw new AppError('O vínculo não pôde ser confirmado. O profissional pode ter desistido.', 409);
        }

        const atualizado = await this.model.findByPk(relatoId);
        return RelatoMapper.toEntity(atualizado);
    }

    async buscarDadosParaNotificacao(relatoId: number): Promise<RelatoNotificacaoDTO | null> {
        const relato = await this.model.findByPk(relatoId, {
            include: [
                {
                    association: 'paciente',
                    attributes: ['id'],
                    include: [
                        {
                            model: this.model.sequelize!.models.Paciente,
                            as: 'paciente',
                            attributes: ['codinome']
                        }
                    ]
                },
                {
                    association: 'profissional',
                    attributes: ['nome']
                }
            ]
        });

        if (!relato) return null;

        return {
            id: relato.id,
            paciente_id: relato.paciente_id,
            titulo: relato.titulo,
            codinomePaciente: relato.paciente?.paciente?.codinome || 'Paciente',
            nomeProfissional: relato.profissional?.nome || 'Profissional'
        };
    }

    async listarRelatosparaPaciente(pacienteId: number, page: number, limit: number, filtros: { busca?: string }): Promise<{ dados: RelatoEntity[]; total: number; }>{
        const offset = (page - 1) * limit;
        const where: any = {
            anonimo: false
        };

        if (filtros.busca) {
            where[Op.or] = [
                { titulo: { [Op.iLike]: `%${filtros.busca}%` } },
                { texto: { [Op.iLike]: `%${filtros.busca}%` } },
                { categoria: { [Op.iLike]: `%${filtros.busca}%` } }
            ];
        }

        const queryOptions = this.getIncludeLikes(pacienteId);

        const { rows, count } = await this.model.findAndCountAll({
            where,
            limit,
            offset,
            order: [['data_envio', 'DESC']],
            ...queryOptions,
        });

        return { dados: rows.map((r: any) => RelatoMapper.toEntity(r)), total: count };
    }
    
    async iniciarTransacao(): Promise<Transaction> { 
        const sequelizeInstance = this.model.sequelize;
        if (!sequelizeInstance) {
            throw new Error("Instância Sequelize não encontrada para iniciar transação.");
        }
        return sequelizeInstance.transaction();
    }
    
    async commit(transaction: Transaction): Promise<void> { 
       await transaction.commit();
    }
    
    async rollback(transaction: Transaction): Promise<void> { 
       await transaction.rollback();
    }

    async deletarRelato(usuarioId: number, relatoId: number): Promise<void> {
        await this.model.destroy({
            where: { 
                id: relatoId,
                paciente_id: usuarioId
            }
        });
    }

    async atualizarRelato(relato: RelatoEntity, transaction?: Transaction): Promise<RelatoEntity> {
        if (!relato.id) {
            throw new Error("Não é possível atualizar relato sem id.");
        }

        const dadosDB = {
            titulo: relato.titulo,
            texto: relato.texto,
            categoria: relato.categoria,
            anonimo: relato.anonimo
        };

        const [rowsAffected] = await this.model.update(dadosDB, {
            where: { id: relato.id },
            transaction
        });

        if (rowsAffected === 0) {
            throw new Error("Não foi possível atualizar o relato.");
        }

        const updatedRelato = await this.model.findByPk(relato.id);
        return RelatoMapper.toEntity(updatedRelato);
    }

    async countRelatos(): Promise<number> {
        return await this.model.count();
    }
}