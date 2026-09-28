// src/infrastructure/database/repositories/PacienteRepository.ts

import { Op, Transaction } from 'sequelize';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { PacienteEntity } from '../../../domain/entities/PacienteEntity';
import { PacienteModel, PacienteAttributes } from '../models/paciente.model';
import { UsuarioModel } from '../models/usuario.model';
import { PacienteMapper } from '../mappers/PacienteMapper';
import AppError from '../../../application/errors/AppError';

interface PacienteCreationDTO {
    idUsuario: number;
    codinome: string | null;
}

export class PacienteRepository implements IPacienteRepository {

    constructor(
        private ModelPaciente: typeof PacienteModel,
        private ModelUsuario: typeof UsuarioModel
    ) { }

    // ------------------------------------------
    // MÉTODOS CRUD
    // ------------------------------------------

    async criar(dados: PacienteCreationDTO, transaction?: Transaction): Promise<PacienteEntity> {
        // 1. Mapeia o DTO de Domínio para o formato do DB (snake_case)
        const dbData: PacienteAttributes = {
            id_usuario: dados.idUsuario,
            codinome: dados.codinome,
        } as PacienteAttributes;

        // 2. Cria o registro no DB
        const record = await this.ModelPaciente.create(dbData, { transaction });

        // 3. Mapeia e retorna a Entidade
        return PacienteMapper.toEntity(record);
    }

    async buscarPorId(id: number): Promise<PacienteEntity | null> {
        const record = await this.ModelPaciente.findByPk(id, {
            include: [
                {
                    model: this.ModelUsuario,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email', 'telefone']
                }
            ]
        });

        if (!record) return null;
        return PacienteMapper.toEntity(record);
    }

    async buscarPorUsuarioId(idUsuario: number): Promise<PacienteEntity | null> {
        const record = await this.ModelPaciente.findOne({ 
            where: { id_usuario: idUsuario },
            include: [
                {
                    model: this.ModelUsuario,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email', 'telefone']
                }
            ]
        });

        if (!record) return null;
        return PacienteMapper.toEntity(record);
    }

    // ------------------------------------------
    // MÉTODOS DE SALVAR (UPDATE)
    // ------------------------------------------

    async salvar(paciente: PacienteEntity, transaction?: Transaction): Promise<void> {
        if (!paciente.id) {
            throw new AppError("Não é possível salvar (update) uma Entidade sem ID.");
        }

        // 1. Mapeia a Entidade para os dados puros do DB (apenas campos que podem mudar)
        const dbData = {
            codinome: paciente.codinome,
        };

        // 2. Executa o UPDATE
        const [rowsAffected] = await this.ModelPaciente.update(dbData, {
            where: { id: paciente.id },
            transaction,
        });

        if (rowsAffected === 0) {
            throw new AppError(`Paciente com ID ${paciente.id} não encontrado para atualização.`);
        }
    }

    async listarPacienteParaAdmin(
        page: number,
        limit: number,
        filtros?: { busca?: string, status?: string }
    ): Promise<{ dados: PacienteEntity[]; total: number; pagina: number; totalPaginas: number }> {

        const offset = (page - 1) * limit;

        const { rows, count } = await this.ModelPaciente.findAndCountAll({
            where: {
                ...(filtros?.status && { status: filtros.status }),

                ...(filtros?.busca && {
                    [Op.or]: [
                        { '$usuario.nome$': { [Op.iLike]: `%${filtros.busca}%` } },
                        { '$usuario.email$': { [Op.iLike]: `%${filtros.busca}%` } },
                        { '$usuario.telefone$': { [Op.iLike]: `%${filtros.busca}%` } },
                        { '$codinome$': { [Op.iLike]: `%${filtros.busca}%` } },
                    ]
                })
            },
            limit,
            offset,
            order: [['id', 'ASC']],
            distinct: true, // Essencial para contar corretamente com joins
            include: [
                {
                    model: this.ModelUsuario,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email', 'tipo_usuario', 'telefone']
                }
            ]
        });

        return {
            dados: rows.map((r: any) => PacienteMapper.toEntity(r)),
            total: count,
            pagina: page,
            totalPaginas: Math.ceil(count / limit)
        };
    }

    async buscarPorCodinome(codinome: string): Promise<Boolean | null> {
        const record = await this.ModelPaciente.findOne({
            where: { codinome },
        });

        if (!record) return null;
        return true;
    }

    // ------------------------------------------
    // MÉTODOS TRANSACIONAIS
    // ------------------------------------------

    async iniciarTransacao(): Promise<Transaction> {
        const sequelizeInstance = this.ModelPaciente.sequelize;
        if (!sequelizeInstance) {
            throw new AppError("Instância Sequelize não encontrada para iniciar transação.");
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