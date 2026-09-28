// // src/infrastructure/websocket/SessaoSignalingGateway.ts

// import { Namespace, Socket } from "socket.io";

// import { ISessionRuntimeService } from "../../domain/services/ISessionRuntimeService";

// import { EntrarSessaoUseCase } from "../../application/use-cases/sessao/EntrarSessaoUseCase";
// import { IniciarSessaoUseCase } from "../../application/use-cases/sessao/IniciarSessaoUseCase";
// import { EncerrarSessaoUseCase } from "../../application/use-cases/sessao/EncerrarSessaoUseCase";
// import { RegistrarPresencaSessaoUseCase } from "../../application/use-cases/sessao/RegistrarPresencaSessaoUseCase";
// import { ParticipanteOfflineUseCase } from "../../application/use-cases/sessao/ParticipanteOfflineUseCase";

// export class SessaoSignalingGateway {

//     constructor(

//         private readonly io: Namespace,

//         private readonly entrarSessaoUseCase: EntrarSessaoUseCase,

//         private readonly iniciarSessaoUseCase: IniciarSessaoUseCase,

//         private readonly encerrarSessaoUseCase: EncerrarSessaoUseCase,

//         private readonly registrarPresencaSessaoUseCase: RegistrarPresencaSessaoUseCase,

//         private readonly participanteOfflineUseCase: ParticipanteOfflineUseCase,

//     ) {

//         this.setupEventListeners();

//     }

//     /**
//      * ==================================================
//      * Eventos
//      * ==================================================
//      */

//     private setupEventListeners(): void {

//         this.io.on("connection", (socket: Socket) => {

//             console.log(`[Signaling] Conectado: ${socket.id}`);

//             socket.on("join-session", (sessaoId: string) =>

//                 this.handleJoinSession(socket, sessaoId)
//             );

//             socket.on("offer", (data) =>

//                 this.handleOffer(socket, data)

//             );

//             socket.on("answer", (data) =>

//                 this.handleAnswer(socket, data)

//             );

//             socket.on(

//                 "ice-candidate", (data) =>

//                 this.handleIceCandidate(socket, data)
//             );

//             socket.on("end-session", (data) =>

//                 this.handleEndSession(socket, data)
//             );

//             socket.on("disconnect", (reason) =>

//                 this.handleDisconnect(socket, reason)
//             );

//             socket.on("heartbeat", ({ sessaoId }) =>
//                 this.handleHeartbeat(socket, sessaoId)
//             );

//         });

//     }

//     /**
//      * ==================================================
//      * JOIN
//      * ==================================================
//      */

//     private async handleJoinSession(

//         socket: Socket,

//         sessaoId: string

//     ): Promise<void> {

//         const usuarioId =
//             socket.data.usuario.id;

//         const tipoUsuario =
//             socket.data.usuario.tipo_usuario;

//         const result =

//             await this.entrarSessaoUseCase.execute({

//                 sessaoId,

//                 usuarioId,

//             });

//         socket.join(sessaoId);

//         if (!result.roomReady)
//             return;

//         this.io
//             .to(sessaoId)
//             .emit("room-ready", {

//                 shouldCreateOffer: false

//             });

//         socket.emit(

//             "room-ready",

//             {

//                 shouldCreateOffer:

//                     result.shouldCreateOffer

//             }

//         );

//     }
//     /**
//      * ==================================================
//      * OFFER
//      * ==================================================
//      */

//     private async handleOffer(

//         socket: Socket, data: {

//             sessaoId: string;

//             offer: RTCSessionDescriptionInit;
//         }

//     ): Promise<void> {

//         await this.iniciarSessaoUseCase.execute(data.sessaoId);

//         this.emitToOthers(socket, data.sessaoId, "offer",

//             {

//                 from: socket.id,

//                 offer: data.offer

//             }

//         );

//     }

//     /**
//      * ==================================================
//      * ANSWER
//      * ==================================================
//      */

//     private handleAnswer(socket: Socket,

//         data: {

//             sessaoId: string;

//             answer: RTCSessionDescriptionInit;

//         }

//     ): void {

//         this.emitToOthers(socket, data.sessaoId, "answer",

//             {

//                 from: socket.id,

//                 answer: data.answer

//             }

//         );

//     }

//     /**
//      * ==================================================
//      * ICE
//      * ==================================================
//      */

//     private handleIceCandidate(socket: Socket,

//         data: {

//             sessaoId: string;

//             candidate: RTCIceCandidateInit;
//         }

//     ): void {

//         this.emitToOthers(socket, data.sessaoId, "ice-candidate",

//             {

//                 from: socket.id,

//                 candidate: data.candidate

//             }

//         );

//     }

//     /**
//      * ==================================================
//      * END SESSION
//      * ==================================================
//      */

//     private async handleEndSession(socket: Socket,

//         data: {

//             sessaoId: string;

//         }

//     ): Promise<void> {

//         const usuarioId = socket.data.usuario.id;

//         await this.encerrarSessaoUseCase.execute({ sessaoId: data.sessaoId, usuarioId });

//         this.io.to(data.sessaoId).emit("session-ended");

//         this.io.in(data.sessaoId).socketsLeave(data.sessaoId);

//         console.log(`🛑 Sessão ${data.sessaoId} encerrada`);
//     }

//     /**
//      * ==================================================
//      * DISCONNECT
//      * ==================================================
//      */

//     /**
//      * Marca imediatamente o participante
//      * como offline.
//      *
//      * Caso o navegador reconecte rapidamente,
//      * o próximo heartbeat restaurará sua presença.
//      */

//     private async handleDisconnect(

//         socket: Socket,

//         reason: string

//     ): Promise<void> {

//         console.log(

//             `[Signaling] ${socket.id} desconectou (${reason})`

//         );

//         const usuarioId = socket.data.usuario?.id;

//         if (!usuarioId)
//             return;

//         const salas =

//             [...socket.rooms]

//                 .filter(room => room !== socket.id);

//         for (const sessaoId of salas) {

//             await this.participanteOfflineUseCase.execute({

//                 sessaoId,

//                 usuarioId

//             });

//         }

//     }
//     /**
//      * ==================================================
//      * MONITORAMENTO
//      * ==================================================
//      */
//     private async handleHeartbeat(

//         socket: Socket,

//         sessaoId: string

//     ): Promise<void> {

//         const usuarioId = socket.data.usuario.id;

//         await this.registrarPresencaSessaoUseCase.execute(

//             sessaoId,

//             usuarioId

//         );


//     }

//     /**
//      * ==================================================
//      * Helper
//      * ==================================================
//      */

//     private emitToOthers(

//         socket: Socket,

//         sessaoId: string,

//         event: string,

//         payload?: unknown

//     ): void {

//         socket.to(sessaoId).emit(event, payload);
//     }
// }