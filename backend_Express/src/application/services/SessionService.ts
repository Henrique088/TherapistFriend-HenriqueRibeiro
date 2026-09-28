// // src/application/services/SessionService.ts

// import { sessionEvents, SESSION_EVENT_TYPES } from "../../infrastructure/events/SessionEvents";

// async finalizarSessao(sessionId: number) {

//     const session = await this.sessionRepository.findById(sessionId);

//     if (!session) {
//         throw new Error("Sessão não encontrada");
//     }

//     session.finalizar();

//     await this.sessionRepository.updateStatus(
//         session.id!,
//         session.status,
//         session.started_at,
//         session.ended_at
//     );

//     // Evento aqui
//     sessionEvents.emit(SESSION_EVENT_TYPES.SESSION_FINALIZED, {
//         sessionId: session.id,
//         patientId: session.patient_id,
//         professionalId: session.professional_id
//     });
// }