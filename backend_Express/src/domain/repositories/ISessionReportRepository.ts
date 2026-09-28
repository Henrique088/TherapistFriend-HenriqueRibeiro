// src/domain/repositories/ISessionReportRepository.ts

import { SessionReportEntity } from "../entities/SessionReportEntity";

export interface ISessionReportRepository {

    criar(report: SessionReportEntity): Promise<SessionReportEntity>;

    buscarPorId(sessionId: string): Promise<SessionReportEntity | null>;

    atualizarComentario(relatorio:SessionReportEntity): Promise<SessionReportEntity>;
    
    listarComFiltros(profissionalId: number, page: number, limit: number, filtros: {codinome?: string, emocao?: string, ordem?: string}): Promise<{
            dados: any[],
            total: number
        }>;
}