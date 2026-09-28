// src/infrastructure/websocket/SignalingService.ts

import { Namespace, Socket } from "socket.io";
import { SocketEvents } from "../constants/SocketEvents";
import { AnswerDTO, EndSessionDTO, IceCandidateDTO, OfferDTO, SessionEndedPayload } from "../../../application/dtos/SignalingDTO";

export class SignalingService {

    constructor(
        private readonly io: Namespace
    ) { }

    /**
     * ==================================================
     * ROOM READY
     * ==================================================
     */

    emitRoomReady(sessaoId: string, socket: Socket, shouldCreateOffer: boolean): void {

        /**
         * Todos recebem room-ready,
         * porém somente um cria o Offer.
         */

        this.io.to(sessaoId).emit(

            SocketEvents.RoomReady,

            {

                shouldCreateOffer: false

            }

        );

        socket.emit(

            SocketEvents.RoomReady,

            {

                shouldCreateOffer

            }

        );

    }

    /**
     * ==================================================
     * OFFER
     * ==================================================
     */

    forwardOffer(socket: Socket, data: OfferDTO,): void {

        socket.to(data.sessaoId).emit(

            SocketEvents.Offer,

            {

                from: socket.id,

                offer: data.offer

            }

        );

    }

    /**
     * ==================================================
     * ANSWER
     * ==================================================
     */

    forwardAnswer(socket: Socket, data: AnswerDTO,): void {

        socket.to(data.sessaoId).emit(

            SocketEvents.Answer,

            {

                from: socket.id,

                answer: data.answer

            }

        );

    }

    /**
     * ==================================================
     * ICE
     * ==================================================
     */

    forwardIceCandidate(socket: Socket, data: IceCandidateDTO,): void {

        socket.to(data.sessaoId).emit(

            SocketEvents.IceCandidate,

            {

                from: socket.id,

                candidate: data.candidate

            }

        );

    }

    /**
     * ==================================================
     * SESSION ENDED
     * ==================================================
     */

    emitSessionEnded(data: EndSessionDTO, payload?: SessionEndedPayload): void {

        this.io.to(data.sessaoId).emit(SocketEvents.SessionEnded, payload);

        this.io.in(data.sessaoId).socketsLeave(data.sessaoId);

    }

    /**
     * ==================================================
     * SESSION TIMEOUT
     * ==================================================
     */

    emitSessionTimeout(sessaoId: string): void {

        this.io.to(sessaoId).emit(SocketEvents.SessionTimeout);

        this.io.in(sessaoId).socketsLeave(sessaoId);

    }

    /**
     * ==================================================
     * PARTICIPANT ONLINE
     * ==================================================
     */

    emitParticipantOnline(sessaoId: string, usuarioId: number): void {

        this.io.to(sessaoId).emit(SocketEvents.ParticipantOnline, { usuarioId });
    }

    /**
     * ==================================================
     * PARTICIPANT OFFLINE
     * ==================================================
     */

    emitParticipantOffline(sessaoId: string, usuarioId: number): void {

        console.log(`🔴 Emitting participant-offline for usuarioId: ${usuarioId} in sessaoId: ${sessaoId}`);

        this.io.to(sessaoId).emit(

            SocketEvents.ParticipantOffline,

            {

                usuarioId

            }

        );

    }


    /**
    * ==================================================
    * Sessao Finalizada
    * ==================================================
    */

    finishSession(sessaoId: string): void {

        this.io.to(sessaoId).emit(SocketEvents.SessionTimeout);

        this.io.in(sessaoId).socketsLeave(sessaoId);

    }

    /**
    * ==================================================
    * ROOM STATUS
    * ==================================================
    */
    emitRoomStatus(
        socket: Socket,
        data: { participantsCount: number; isOtherOnline: boolean }
    ): void {
        socket.emit(SocketEvents.RoomStatus, data);
    }

}