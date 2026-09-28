// // infrastructure/queue/workers/HeartbeatWorker.ts

// import EventDispatcher from "../../../domain/@shared/events/EventDispatcher";
// import { ParticipantOffline } from "../../../domain/events/sessao/ParticipantOffline";
// import { SessionTimeout } from "../../../domain/events/sessao/SessionTimeout";
// import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";

// export class HeartbeatMonitorWorker {

//     constructor(
//         private readonly sessionRuntime: ISessionRuntimeService,
//         private readonly eventDispatcher: EventDispatcher
//     ) {}

//     async execute() {

//         const expirados =
//             await this.sessionRuntime.listExpiredHeartbeats();

//         for (const heartbeat of expirados) {

//             const {
//                 sessaoId,
//                 usuarioId
//             } = heartbeat;

//             await this.sessionRuntime.removeOnline(
//                 sessaoId,
//                 usuarioId
//             );

//             this.eventDispatcher.notify(
//                 new ParticipantOffline({
//                     sessaoId,
//                     usuarioId
//                 })
//             );

//             const online =
//                 await this.sessionRuntime.getOnlineCount(
//                     sessaoId
//                 );

//             if (online === 0) {

//                 this.eventDispatcher.notify(
//                     new SessionTimeout({
//                         sessaoId
//                     })
//                 );

//             }

//         }

//     }

// }