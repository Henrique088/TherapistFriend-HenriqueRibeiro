// // src/application/services/SessionReportService.ts

// import { ISessionReportRepository } from "../../domain/repositories/ISessionReportRepository";
// import { SessionReportEntity } from "../../domain/entities/SessionReportEntity";
// import { ISessaoRepository } from "../../domain/repositories/ISessaoRepository";
// import AppError from "../errors/AppError";

// export class SessionReportService {

//     constructor(
//         private reportRepository: ISessionReportRepository,
//         private sessaoRepository: ISessaoRepository) {}

//     async gerarRelatorio(entity: SessionReportEntity) {

//     const session = await this.sessaoRepository.buscarPorId(entity.session_id);

//     if (!session) {
//         throw new AppError("Sessão não encontrada");
//     }

//     if (session.status !== 'finalizada') {
//         throw new AppError("Relatório só pode ser gerado após sessão finalizada");
//     }

//     const existing = await this.reportRepository.buscarPorId(entity.session_id);

//     if (existing) {
//         throw new AppError("Relatório já existe para essa sessão");
//     }

//     return await this.reportRepository.criar(entity);
// }

//     async buscarPorSessao(sessionId: string) {
//         return await this.reportRepository.buscarPorId(sessionId);
//     }

//     async editarComentario(sessionId: string, comment: string, profissionalId: number) {

//     const session = await this.sessaoRepository.buscarPorId(sessionId);

//     if (!session) {
//         throw new AppError("Sessão não encontrada");
//     }

//     if (session.profissional_id !== profissionalId) {
//         throw new AppError("Apenas o profissional da sessão pode editar o comentário");
//     }

//     await this.reportRepository.atualizarComentario(sessionId, comment);
// }
// }