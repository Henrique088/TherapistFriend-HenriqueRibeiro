// src/infrastructure/repositories/SessaoRepository.ts

import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import { SessaoModelStatic } from '../models/sessao.model';
import { SessaoMapper } from '../mappers/SessaoMapper';

interface RepositorioDTO {
    codinome: string;
    dataInicio: Date;
    dataFim: Date;
}

export class SessaoRepository implements ISessaoRepository {
    constructor(private model: SessaoModelStatic) { }

    async criar(sessao: SessaoEntity): Promise<SessaoEntity> {
        const dados = sessao.toJSON();
        const sessaoCriada = await this.model.create(
            dados as any
        );

        return SessaoMapper.toEntity(sessaoCriada);
    }

    async buscarPorId(id: string): Promise<SessaoEntity | null> {

        const sessao = await this.model.findByPk(id);
        return sessao ? SessaoMapper.toEntity(sessao) : null;
    }

    async encerrarSessao(sessao: SessaoEntity): Promise<void> {
        await this.model.update(
            {
                status: 'finalizada',
                data_fim: sessao.data_fim
            },
            { where: { id: sessao.id } }
        );

    }



    async listarPorUsuario(usuarioId: number, tipo: 'paciente' | 'profissional'): Promise<SessaoEntity[]> {
        const whereClause = tipo === 'paciente'
            ? { paciente_id: usuarioId }
            : { profissional_id: usuarioId };

        const sessoes = await this.model.findAll({
            where: whereClause,
            order: [['data_inicio', 'DESC']]
        });

        return sessoes.map(SessaoMapper.toEntity);
    }

    async atualizar(dados: SessaoEntity): Promise<void> {
        const sessao = dados.toJSON();
        console.log(sessao)
        await this.model.update({
            status: sessao.status,
            data_inicio_real: sessao.data_inicio_real

        }, {
            where: { id: sessao.id }
        })
    }

    async buscarDadosParaNotificacaoRelatorio(sessaoId: string): Promise<RepositorioDTO | null> {
        const sessao = await this.model.findOne({
            where: { id: sessaoId },
            include: [
                {
                    association: 'agendamento',
                    include: [
                        {
                            association: 'paciente', 
                            attributes: ['codinome'] // Busca apenas o necessário
                        }
                    ]
                }
            ]
        });

        if (!sessao) return null;

        // O 'any' aqui é usado porque o Sequelize retorna o objeto com as associações aninhadas
        const rawSessao = sessao.get({ plain: true }) as any;

        return {
            codinome: rawSessao.agendamento?.paciente?.codinome || 'Paciente',
            dataInicio: rawSessao.data_inicio_real || rawSessao.data_inicio,
            dataFim: rawSessao.data_fim
        };
    }
}