// // src/infrastructure/queue/workers/SessionReportWorker.ts

// import { Worker, Job } from "bullmq";
// import { redisConnection } from "../../config/redis";
// import { SessionReportService } from "../../../application/services/SessionReportService";
// import { ISessionReportSummary, SessionReportEntity } from "../../../domain/entities/SessionReportEntity";

// export function setupSessionReportWorker(
//     sessionReportService: SessionReportService
// ) {
//     const worker = new Worker("session-report", async (job: Job) => {
//         switch (job.name) {
//             case "gerar-relatorio-sessao":
//                 const { sessionId, patientId, professionalId } = job.data;

//                 console.log(`[SessionWorker] Consolidando relatório da sessão ${sessionId}`);

//                 // 1. Idempotência: Evita duplicidade se o job re-executar
//                 const existing = await sessionReportService.buscarPorSessao(sessionId);
//                 if (existing) {
//                     console.log(`[SessionWorker] Relatório já existe. Ignorando.`);
//                     return;
//                 }

//                 /**
//                  * 2. BUSCA DE DADOS (Simulação ou Chamada gRPC/Redis)
//                
//                  */



//                 const summary: ISessionReportSummary = {
//                     emocao_predominante: "Calma", // Ex: Cálculos baseados na moda estatística dos frames
//                     confianca_media: 88,
//                     timeline: [
//                         { timestamp: "05:00", label: "Neutral", score: 40 },
//                         { timestamp: "15:00", label: "Happy", score: 75 },
//                         { timestamp: "30:00", label: "Anxious", score: 85 },
//                         { timestamp: "45:00", label: "Calm", score: 50 },
//                     ],
//                     insights_ia: {
//                         nivel_ansiedade: "moderado",
//                         sugestao_abordagem: "O paciente apresentou um pico de ansiedade aos 30 minutos quando o tema 'carreira' foi abordado. Recomenda-se explorar gatilhos de estresse no ambiente de trabalho na próxima sessão.",
//                         picos_emocionais: 2
//                     }
//                 };

//                 // 3. Mapeamento para a Entidade de Domínio
//                 const entity = new SessionReportEntity({
//                     session_id: sessionId,
//                     paciente_id: patientId,
//                     profissional_id: professionalId,
//                     summary: summary, // Agora no formato correto para o JSONB
//                     profissional_comment: null // Médico preencherá depois no Dashboard
//                 });

//                 // 4. Persistência via Service -> Repository -> SessionReportModel
//                 const result = await sessionReportService.gerarRelatorio(entity);

//                 console.log(`[SessionWorker] Relatório ${result.id} salvo com sucesso para sessão ${sessionId}`);
//                 return result;
//         }
//     }, {
//         connection: redisConnection,
//         concurrency: 3
//     });

//     worker.on("failed", (job, err) => {
//         console.error(
//             `[SessionWorker] Job ${job?.name} falhou: ${err.message}`
//         );
//     });
// }