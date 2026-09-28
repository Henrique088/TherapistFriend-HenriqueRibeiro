// src/infrastructure/database/repositories/UsuarioRepository.ts

import { Op, Transaction } from 'sequelize';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { UsuarioModel } from '../models/usuario.model';
import { UsuarioMapper } from '../mappers/UsuarioMapper';

export class UsuarioRepository implements IUsuarioRepository {

    constructor(private usuarioModel: typeof UsuarioModel) { }

    // ------------------------------------------
    // CONSULTAS
    // ------------------------------------------

    async buscarPorEmail(email: string): Promise<UsuarioEntity | null> {
        const record = await this.usuarioModel.findOne({
            where: { email },
        });

        if (!record) {
            return null;
        }

        return UsuarioMapper.toEntity(record);
    }

    async buscarPorTelefone(telefone: string): Promise<UsuarioEntity | null> {
        const record = await this.usuarioModel.findOne({
            where: { telefone },
        });

        if (!record) {
            return null;
        }

        return UsuarioMapper.toEntity(record);
    }

    async buscarPorId(id: number): Promise<UsuarioEntity | null> {
        const record = await this.usuarioModel.findByPk(id);

        if (!record) {
            return null;
        }

        return UsuarioMapper.toEntity(record);
    }

    // ------------------------------------------
    // MUTAÇÕES
    // ------------------------------------------

    async criar(dados: any, transaction?: Transaction): Promise<UsuarioEntity> {
        const record = await this.usuarioModel.create(dados, { transaction });
        return UsuarioMapper.toEntity(record);
    }

    async salvar(usuario: UsuarioEntity, transaction?: Transaction): Promise<UsuarioEntity> {
        if (!usuario.id) {
            throw new Error("Não é possível salvar (update) uma Entidade sem ID.");
        }

        const dadosDB = UsuarioMapper.toDbData(usuario);

        const [rowsAffected] = await this.usuarioModel.update(dadosDB, {
            where: { id: usuario.id },
            transaction,
        });

        if (rowsAffected === 0) {
            throw new Error(`Usuário com ID ${usuario.id} não encontrado para atualização.`);
        }

        return usuario;
    }

    async deletar(id: number, transaction?: Transaction): Promise<void> {
        await this.usuarioModel.destroy({
            where: { id: id },
            transaction
        });
    }

    async countUsuarios(): Promise<number> {
        return await this.usuarioModel.count();
    }

    async countUsuariosPorTipo(tipo: 'paciente' | 'profissional'): Promise<number> {
        return await this.usuarioModel.count({
            where: { tipo_usuario: tipo }
        });
    }

    async listar(page: number, limit: number, filtros: { busca?: string }): Promise<{
        data: UsuarioEntity[];
        total: number;
        pagina: number;
        totalPaginas: number;
    }> {
        const offset = (page - 1) * limit;
        const whereClause: any = {};

        if (filtros.busca) {
            whereClause[Op.or] = [
                { nome: { [Op.iLike]: `%${filtros.busca}%` } },
                { email: { [Op.iLike]: `%${filtros.busca}%` } },
                { telefone: { [Op.iLike]: `%${filtros.busca}%` } }
            ];
        }

        const { rows: records, count: total } = await this.usuarioModel.findAndCountAll({
            where: whereClause,
            offset,
            limit,
            order: [['data_cadastro', 'ASC']]
        });

        const totalPaginas = Math.ceil(total / limit);

        return {
            data: records.map(record => UsuarioMapper.toEntity(record)),
            total,
            pagina: page,
            totalPaginas
        };
    }

    // ------------------------------------------
    // TRANSAÇÕES
    // ------------------------------------------

    async iniciarTransacao(): Promise<Transaction> {
        const sequelizeInstance = this.usuarioModel.sequelize;
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
}