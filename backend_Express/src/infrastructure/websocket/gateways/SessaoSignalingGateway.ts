// src/infrastructure/websocket/gateways/SessaoSignalingGateway.ts

import { Namespace, Socket } from "socket.io";
import { SocketEvents } from "../constants/SocketEvents";

import { AnswerDTO, EndSessionDTO, IceCandidateDTO, OfferDTO } from "../../../application/dtos/SignalingDTO";
import { SignalingController } from "../controller/SignalingController";

export class SessaoSignalingGateway {

    constructor(

        private readonly io: Namespace,

        private readonly controller: SignalingController,

    ) {

        this.setupEventListeners();

    }

    /**
     * ==================================================
     * Eventos
     * ==================================================
     */

    private setupEventListeners(): void {

        this.io.on("connection", (socket: Socket) => {

            console.log(`[Signaling] Conectado: ${socket.id}`);

            socket.on("join-session", (sessaoId: string) =>

                this.handleJoinSession(socket, sessaoId)
            );

            socket.on(SocketEvents.Offer, (data) =>

                this.handleOffer(socket, data)

            );

            socket.on(SocketEvents.Answer, (data) =>

                this.handleAnswer(socket, data)

            );

            socket.on(

                SocketEvents.IceCandidate, (data) =>

                this.handleIceCandidate(socket, data)
            );

            socket.on(SocketEvents.EndSession, (data) =>

                this.handleEndSession(socket, data)
            );

            socket.on(SocketEvents.Disconnect, (reason) =>

                this.handleDisconnect(socket, reason)
            );

            socket.on(SocketEvents.Heartbeat, ({ sessaoId }) =>
                this.handleHeartbeat(socket, sessaoId)
            );

            socket.on(SocketEvents.CheckRoomStatus, (data) =>
                this.handleCheckRoomStatus(socket, data)
            );

        });

    }

    /**
     * ==================================================
     * JOIN
     * ==================================================
     */

    private async handleJoinSession(socket: Socket, sessaoId: string): Promise<void> {

        await this.controller.joinSession(socket, sessaoId);

    }
    /**
     * ==================================================
     * OFFER
     * ==================================================
     */

    private async handleOffer(socket: Socket, data: OfferDTO): Promise<void> {

        await this.controller.offer(socket, data);

    }

    /**
     * ==================================================
     * ANSWER
     * ==================================================
     */

    private handleAnswer(socket: Socket, data: AnswerDTO): void {

        this.controller.answer(socket, data);

    }

    /**
     * ==================================================
     * ICE
     * ==================================================
     */

    private handleIceCandidate(socket: Socket, data: IceCandidateDTO): void {

        this.controller.iceCandidate(socket, data);

    }

    /**
     * ==================================================
     * END SESSION
     * ==================================================
     */

    private async handleEndSession(socket: Socket, data: EndSessionDTO): Promise<void> {

        await this.controller.endSession(socket, data)

    }

    /**
     * ==================================================
     * DISCONNECT
     * ==================================================
     */

    /**
     * Marca imediatamente o participante
     * como offline.
     *
     * Caso o navegador reconecte rapidamente,
     * o próximo heartbeat restaurará sua presença.
     */

    private async handleDisconnect(socket: Socket, reason: string): Promise<void> {

        await this.controller.disconnect(socket, reason);

    }
    /**
     * ==================================================
     * MONITORAMENTO
     * ==================================================
     */

    private async handleHeartbeat(socket: Socket, sessaoId: string): Promise<void> {

        console.log("💚 Heartbeat recebido no gateway", sessaoId, socket.id);

        await this.controller.heartbeat(socket, sessaoId);

    }

    /**
     * ==================================================
     * CHECK ROOM STATUS
     * ==================================================
     */
    private async handleCheckRoomStatus(socket: Socket, data: { sessaoId: string }): Promise<void> {
        
        await this.controller.checkRoomStatus(socket, data);
    }


}