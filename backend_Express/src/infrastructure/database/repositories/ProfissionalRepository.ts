// src/infrastructure/database/repositories/ProfissionalRepository.ts

import { Op, Transaction } from 'sequelize';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { ProfissionalEntity } from '../../../domain/entities/ProfissionalEntity';
import { ProfissionalModel, ProfissionalModelStatic } from '../models/profissional.model';
import { UsuarioModelStatic } from '../models/usuario.model';
import { EspecialidadeModelStatic } from '../models/especialidade.model';
import { ProfissionalEspecialidadeModelStatic } from '../models/profissional_especialidade.model';
import { HistoricoValidacaoModelStatic } from '../models/historico_validacao_profissional.model';
import { ProfissionalMapper } from '../mappers/ProfissionalMapper';
import AppError from '../../../application/errors/AppError';

// Interface para o DTO de Filtros
interface IProfissionalFiltroDTO {
    pagina: number;
    limite: number;
    nome?: string;
    especialidade?: string;
}

interface ProfissionalModelInstance extends ProfissionalModel {
    setEspecialidades: (especialidadeIds: number[], options?: { transaction?: Transaction }) => Promise<void>;
    addEspecialidades: (especialidadeIds: number[], options?: { transaction?: Transaction }) => Promise<void>;
}

export class ProfissionalRepository implements IProfissionalRepository {

    public ModelProfissional: ProfissionalModelStatic;
    private ModelUsuario: UsuarioModelStatic;
    private ModelEspecialidade: EspecialidadeModelStatic;
    private ModelPivot: ProfissionalEspecialidadeModelStatic;
    private ModelHistoricoValidacao: HistoricoValidacaoModelStatic;

    constructor(
        ModelProfissional: ProfissionalModelStatic,
        ModelUsuario: UsuarioModelStatic,
        ModelPivot: ProfissionalEspecialidadeModelStatic,
        ModelEspecialidade: EspecialidadeModelStatic,
        ModelHistoricoValidacao: HistoricoValidacaoModelStatic
    ) {
        this.ModelProfissional = ModelProfissional;
        this.ModelUsuario = ModelUsuario;
        this.ModelPivot = ModelPivot;
        this.ModelEspecialidade = ModelEspecialidade;
        this.ModelHistoricoValidacao = ModelHistoricoValidacao;
    }

    async criar(data: any, options: { transaction?: Transaction } = {}): Promise<ProfissionalEntity> {
        const record = await this.ModelProfissional.create(data, options);
        return ProfissionalMapper.toEntity(record);
    }

    async buscarPorUsuarioId(id: number): Promise<ProfissionalEntity | null> {
        const record = await this.ModelProfissional.findByPk(id, {
            include: [
                { model: this.ModelUsuario, as: 'usuario' },
                {
                    model: this.ModelEspecialidade,
                    as: 'especialidades',
                    through: { attributes: [] }
                }
            ]
        });

        if (!record) return null;
        return ProfissionalMapper.toEntity(record);
    }

    async buscarPorUsuario(idUsuario: number): Promise<ProfissionalEntity | null> {
        const record = await this.ModelProfissional.findOne({
            where: { id_usuario: idUsuario },
            include: [
                { model: this.ModelUsuario, as: 'usuario' },
                {
                    model: this.ModelEspecialidade,
                    as: 'especialidades',
                    through: { attributes: [] }
                }
            ]
        });

        if (!record) return null;
        return ProfissionalMapper.toEntity(record);
    }

    /**
     * Gerencia a relação Muitos-para-Muitos na tabela pivot
     */
    async vincularEspecialidades(profissionalId: number, especialidadesIds: number[], transaction?: Transaction): Promise<void> {
        const record = await this.ModelProfissional.findByPk(profissionalId, { transaction }) as ProfissionalModelInstance;

        if (!record) {
            throw new AppError("Profissional não encontrado para vincular especialidades.");
        }

        await record.setEspecialidades(especialidadesIds, { transaction });
    }

    async atualizar(profissional: ProfissionalEntity, options?: { transaction?: any }): Promise<void> {
        if (!profissional.id) throw new AppError("Não é possível atualizar um profissional sem ID.");

        await ProfissionalModel.update({
            cpf: profissional.cpf,
            crp: profissional.crp,
            bio: profissional.bio,
            validado: profissional.validado,
            status: profissional.status,
        }, {
            where: { id: profissional.id },
            transaction: options?.transaction
        });
    }

    async buscarComFiltros({ pagina, limite, nome, especialidade }: IProfissionalFiltroDTO) {
        const offset = (pagina - 1) * limite;
        const buscaTermo = nome || especialidade;

        const { rows, count } = await this.ModelProfissional.findAndCountAll({
            limit: limite,
            offset: offset,
            distinct: true,
            include: [
                {
                    model: this.ModelUsuario,
                    as: 'usuario',
                    attributes: ['nome', 'email'],
                    required: false
                },
                {
                    model: this.ModelEspecialidade,
                    as: 'especialidades',
                    attributes: ['id', 'nome'],
                    through: { attributes: [] },
                    required: false
                }
            ],
            where: {
                validado: true,
                ...(buscaTermo && {
                    [Op.or]: [
                        { '$usuario.nome$': { [Op.iLike]: `%${buscaTermo}%` } },
                        { '$especialidades.nome$': { [Op.iLike]: `%${buscaTermo}%` } }
                    ]
                })
            },
            order: [['id', 'ASC']]
        });
        
        return {
            data: rows.map(record => ProfissionalMapper.toEntity(record)),
            total: count,
            pagina,
            totalPaginas: Math.ceil(count / limite)
        };
    }

    async validarProfissional(profissional: ProfissionalEntity): Promise<void> {
        if (!profissional.id) throw new AppError("Não é possível atualizar um profissional sem ID.");

        await ProfissionalModel.update({
            validado: profissional.validado,
            data_validacao: new Date(),
            admin_id: profissional.admin_id,
            status: profissional.status
        }, {
            where: { id: profissional.id }
        });
    }

    async listarProfissionaisParaAdmin(
        page: number,
        limit: number,
        filtros?: { busca?: string, status?: string }
    ): Promise<{ dados: ProfissionalEntity[]; total: number; pagina: number; totalPaginas: number }> {

        const offset = (page - 1) * limit;

        const { rows, count } = await this.ModelProfissional.findAndCountAll({
            where: {
                ...(filtros?.status && { status: filtros.status }),
                ...(filtros?.busca && {
                    [Op.or]: [
                        { '$usuario.nome$': { [Op.iLike]: `%${filtros.busca}%` } },
                        { '$usuario.email$': { [Op.iLike]: `%${filtros.busca}%` } },
                        { '$cpf$': { [Op.iLike]: `%${filtros.busca}%` } },
                        { '$crp$': { [Op.iLike]: `%${filtros.busca}%` } }
                    ]
                })
            },
            limit,
            offset,
            order: [['id', 'ASC']],
            distinct: true,
            include: [
                {
                    model: this.ModelUsuario,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email', 'tipo_usuario', 'telefone']
                },
                {
                    model: this.ModelHistoricoValidacao,
                    as: 'historicos',
                    limit: 5,
                    order: [['data_decisao', 'DESC']],
                    separate: true
                }
            ]
        });

        return {
            dados: rows.map(record => ProfissionalMapper.toEntity(record)),
            total: count,
            pagina: page,
            totalPaginas: Math.ceil(count / limit)
        };
    }

    async buscarPorUsuarioComHistorico(idUsuario: number): Promise<ProfissionalEntity | null> {
        const record = await this.ModelProfissional.findOne({
            where: { id_usuario: idUsuario },
            include: [
                {
                    model: this.ModelHistoricoValidacao,
                    as: 'historicos',
                    limit: 1,
                    order: [['data_decisao', 'DESC']],
                },
                {
                    model: this.ModelEspecialidade,
                    as: 'especialidades',
                    through: { attributes: [] }
                }
            ]
        });

        if (!record) return null;
        return ProfissionalMapper.toEntity(record);
    }

    // --- Métodos de Gestão de Transação ---

    async iniciarTransacao(): Promise<Transaction> {
        const sequelizeInstance = this.ModelProfissional.sequelize;
        if (!sequelizeInstance) {
            throw new AppError("Instância Sequelize não encontrada no modelo.");
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