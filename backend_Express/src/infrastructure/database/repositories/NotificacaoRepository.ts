// src/infrastructure/repositories/NotificacaoRepository.ts

import { Op } from 'sequelize';
import { NotificacaoModel } from '../models/notificacao.model';
import { INotificacaoRepository } from '../../../domain/repositories/INotificacaoRepository';
import { NotificacaoEntity, NotificacaoProps } from '../../../domain/entities/NotificacaoEntity';

export class NotificacaoRepository implements INotificacaoRepository {
    constructor(private model: typeof NotificacaoModel) { }

    async criar(dados: NotificacaoProps): Promise<NotificacaoEntity> {
        const novaNotificacao = await this.model.create({
            usuario_id: dados.usuario_id,
            titulo: dados.titulo,
            mensagem: dados.mensagem,
            tipo: dados.tipo,
            lida: dados.lida || false,
            metadata: dados.metadata // JSONB inserido diretamente
        });

        return new NotificacaoEntity({
            id: novaNotificacao.id,
            usuario_id: novaNotificacao.usuario_id,
            titulo: novaNotificacao.titulo,
            mensagem: novaNotificacao.mensagem,
            tipo: novaNotificacao.tipo as any,
            lida: novaNotificacao.lida,
            metadata: novaNotificacao.metadata,
            data_criacao: novaNotificacao.createdAt
        });
    }

    async buscarPorUsuario(usuarioId: number): Promise<NotificacaoEntity[]> {
        const notificacoes = await this.model.findAll({
            where: { usuario_id: usuarioId },
            order: [['created_at', 'DESC']]
        });

        return notificacoes.map(n => new NotificacaoEntity({
            id: n.id,
            usuario_id: n.usuario_id,
            titulo: n.titulo,
            mensagem: n.mensagem,
            tipo: n.tipo as any,
            lida: n.lida,
            metadata: n.metadata,
            data_criacao: n.createdAt
        }));
    }

    async marcarComoLida(usuarioId: number, notificacaoId: number): Promise<void> {

        // Atualiza o campo 'lida' para true
        await this.model.update(
            { lida: true },
            { where: { id: notificacaoId } }
        );
    }

    async contarNaoLidas(usuarioId: number): Promise<number> {
        const count = await this.model.count({
            where: {
                usuario_id: usuarioId,
                lida: false
            }
        });
        return count;
    }

    async buscarPorId(notificacaoId: number): Promise<NotificacaoEntity | null> {
        const notificacao = await this.model.findByPk(notificacaoId);
        if (!notificacao) {
            return null;
        }

        return new NotificacaoEntity({
            id: notificacao.id,
            usuario_id: notificacao.usuario_id,
            titulo: notificacao.titulo,
            mensagem: notificacao.mensagem,
            tipo: notificacao.tipo as any,
            lida: notificacao.lida,
            metadata: notificacao.metadata,
            data_criacao: notificacao.createdAt
        });
    }

    async listar(usuarioId: number, page: number, limit: number, filtro?: string[]): Promise<{
        notificacoes: NotificacaoEntity[];
        pagina: number;
        limite: number;
        total: number;
        totalPaginas: number;
    }> {
        const offset = (page - 1) * limit;

        const whereClause: any = {
            usuario_id: usuarioId,
            lida: false
        };

        if (filtro && filtro.length > 0) {
            const filtros = Array.isArray(filtro) ? filtro : [filtro];
            whereClause.tipo = { [Op.in]: filtros };
        }

        const { count, rows } = await this.model.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: limit,
            offset: offset
        });

        const notificacoes = rows.map(n => new NotificacaoEntity({
            id: n.id,
            usuario_id: n.usuario_id,
            titulo: n.titulo,
            mensagem: n.mensagem,
            tipo: n.tipo as any,
            lida: n.lida,
            metadata: n.metadata,
            data_criacao: n.createdAt
        }));

        return {
            notificacoes,
            pagina: page,
            limite: limit,
            total: count,
            totalPaginas: Math.ceil(count / limit)
        };
    }
}