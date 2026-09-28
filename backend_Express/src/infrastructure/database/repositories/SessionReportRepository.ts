// src/infrastructure/repositories/SessionReportRepository.ts


import { Op } from "sequelize";
import { ISessionReportRepository } from "../../../domain/repositories/ISessionReportRepository";
import { SessionReportEntity } from "../../../domain/entities/SessionReportEntity";
import { SessionReportModelStatic } from "../models/sessao_report.model";
import { SessionReportMapper } from "../mappers/SessionReportMapper";

export class SessionReportRepository implements ISessionReportRepository {

    constructor(
        private sessionReportModel: SessionReportModelStatic
    ) { }

    async criar(report: SessionReportEntity): Promise<SessionReportEntity> {

        const persistence = SessionReportMapper.toPersistence(report);

        const created = await this.sessionReportModel.create(persistence);

        return SessionReportMapper.toDomain(created);
    }

    async buscarPorId(sessionId: string): Promise<SessionReportEntity | null> {

        const report = await this.sessionReportModel.findOne({
            where: { session_id: sessionId }
        });

        if (!report) return null;


        return SessionReportMapper.toDomain(report);
    }

    async atualizarComentario(relatorio: SessionReportEntity): Promise<SessionReportEntity> {
        const persistence = SessionReportMapper.toPersistence(relatorio);

        const [rowsAffected] = await this.sessionReportModel.update(persistence, {
            where: { id: relatorio.id },
            returning: true
        });

        if (rowsAffected === 0) {
            throw new Error("Não foi possível atualizar o relato.");
        }

        return relatorio;

    }

    async listarComFiltros(
    profissionalId: number,
    page: number,
    limit: number,
    filtros: { codinome?: string; emocao?: string; ordem?: string }
): Promise<{ dados: any[]; total: number; }> {

    const offset = (page - 1) * limit;
    const ordenamento = filtros.ordem ? filtros.ordem.toUpperCase() : 'DESC';

    // Filtros para a tabela SessionReport
    const reportWhere: any = {
        profissional_id: profissionalId
    };

    // Filtro por emoção predominante no campo JSON
    if (filtros.emocao && filtros.emocao.trim().length > 0) {
        reportWhere.summary = {
            [Op.contains]: {
                emocao_predominante: filtros.emocao
            }
        };
    }


    const pacienteWhere: any = {};

    if (filtros.codinome && filtros.codinome.trim().length > 0) {
        pacienteWhere.codinome = { [Op.iLike]: `%${filtros.codinome.trim()}%` };
    }

    // A busca principal
    const { rows, count } = await this.sessionReportModel.findAndCountAll({
        where: reportWhere,
        limit,
        offset,
        order: [['created_at', ordenamento]],
        include: [
            {
                association: 'sessao',
                required: true,
                include: [
                    {
                        association: 'agendamento',
                        required: true,
                        include: [
                            {
                                association: 'paciente',
                                required: Object.keys(pacienteWhere).length > 0,
                                where: Object.keys(pacienteWhere).length > 0 ? pacienteWhere : undefined,
                                attributes: ['codinome']
                            }
                        ]
                    }
                ]
            }
        ],
        raw: false,
        nest: true
    });

    return {
        dados: rows.map(r => r.get({ plain: true })),
        total: count
    };
}
}