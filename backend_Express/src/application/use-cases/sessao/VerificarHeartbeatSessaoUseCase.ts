// // src/application/use-cases/sessao/VerificarHeartbeatSessaoUseCase.ts

// import EventDispatcher from "../../../domain/@shared/events/EventDispatcher";

// import { SessionTimeout } from "../../../domain/events/sessao/SessionTimeout";

// import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";

// export class VerificarHeartbeatSessaoUseCase {

//     private readonly TIMEOUT_MS = 30_000;

//     constructor(

//         private readonly runtime: ISessionRuntimeService,

//         private readonly dispatcher: EventDispatcher

//     ) { }

//     async execute(): Promise<void> {

//         const sessoes =

//             await this.runtime.getActiveSessions();

//         for (const sessaoId of sessoes) {

//             await this.processSession(sessaoId);

//         }

//     }

//     private async processSession(

//         sessaoId: string

//     ): Promise<void> {

//         const heartbeats =

//             await this.runtime.getHeartbeats(sessaoId);

//         for (const [usuarioId, timestamp] of Object.entries(heartbeats)) {

//             await this.processHeartbeat(

//                 sessaoId,

//                 Number(usuarioId),

//                 Number(timestamp)

//             );

//         }

//     }

//     private async processHeartbeat(

//         sessaoId: string,

//         usuarioId: number,

//         timestamp: number

//     ): Promise<void> {

//         const expired =

//             Date.now() - timestamp >= this.TIMEOUT_MS;

//         if (!expired)

//             return;

//         console.log(

//             `⏰ Heartbeat expirado (${usuarioId})`

//         );

//         await this.runtime.invalidateSession(

//             sessaoId

//         );

//         this.dispatcher.notify(

//             new SessionTimeout({

//                 sessaoId

//             })

//         );

//     }

// }