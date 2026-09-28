// src/infrastructure/websocket/sessao/SignalingController.ts

import { Socket } from "socket.io";

import { EntrarSessaoUseCase } from "../../../application/use-cases/sessao/EntrarSessaoUseCase";
import { IniciarSessaoUseCase } from "../../../application/use-cases/sessao/IniciarSessaoUseCase";
import { EncerrarSessaoUseCase } from "../../../application/use-cases/sessao/EncerrarSessaoUseCase";
import { RegistrarPresencaSessaoUseCase } from "../../../application/use-cases/sessao/RegistrarPresencaSessaoUseCase";
import { ParticipanteOfflineUseCase } from "../../../application/use-cases/sessao/ParticipanteOfflineUseCase";

import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";
import { SignalingService } from "../signaling/SignalingService";

export class SignalingController {

    constructor(
        private readonly signaling: SignalingService,
        private readonly sessionRuntime: ISessionRuntimeService,
        private readonly entrarSessaoUseCase: EntrarSessaoUseCase,
        private readonly iniciarSessaoUseCase: IniciarSessaoUseCase,
        private readonly encerrarSessaoUseCase: EncerrarSessaoUseCase,
        private readonly registrarPresencaSessaoUseCase: RegistrarPresencaSessaoUseCase,
        private readonly participanteOfflineUseCase: ParticipanteOfflineUseCase
    ) { }

    async joinSession(socket: Socket, sessaoId: string): Promise<void> {
        const usuarioId = socket.data.usuario.id;
        const tipoUsuario = socket.data.usuario.tipo_usuario;

        const result = await this.entrarSessaoUseCase.execute({ sessaoId, usuarioId });

        socket.join(sessaoId);

        // Registra presença no Redis runtime
        await this.sessionRuntime.registerPresence(sessaoId, usuarioId);

        if (result.participantesOnline < 2) return;

        const shouldCreateOffer = tipoUsuario === "profissional";

        this.signaling.emitRoomReady(sessaoId, socket, shouldCreateOffer);
        this.signaling.emitParticipantOnline(sessaoId, usuarioId);
    }

    async disconnect(socket: Socket, reason: string): Promise<void> {
        console.log(`[Signaling] ${socket.id} desconectou (${reason})`);

        const usuarioId = socket.data.usuario?.id;
        if (!usuarioId) return;

        const salas = [...socket.rooms].filter(room => room !== socket.id);

        for (const sessaoId of salas) {
            await this.sessionRuntime.markOffline(sessaoId, usuarioId);
            await this.participanteOfflineUseCase.execute({ sessaoId, usuarioId });
        }
    }

    async checkRoomStatus(socket: Socket, data: { sessaoId: string }): Promise<void> {
        const usuarioId = socket.data.usuario?.id;
        if (!usuarioId) return;

        const { sessaoId } = data;

        // Busca o estado de presença de todos os participantes no Redis
        const presences = await this.sessionRuntime.getPresence(sessaoId);

        // Filtra apenas os participantes que estão marcados como online
        const participantesOnline = presences.filter(p => p.online);

        const participantsCount = participantesOnline.length;
        const isOtherOnline = participantesOnline.some(p => p.usuarioId !== usuarioId);

        // Responde diretamente para o socket que requisitou
        this.signaling.emitRoomStatus(socket, {
            participantsCount,
            isOtherOnline
        });
    }

    async offer(socket: Socket, data: { sessaoId: string; offer: RTCSessionDescriptionInit; }): Promise<void> {
        try {
            await this.iniciarSessaoUseCase.execute(data.sessaoId);
            this.signaling.forwardOffer(socket, data);
        } catch (error: any) {
            console.error(`[Signaling] Erro ao iniciar sessão: ${error.message}`);
        }
    }

    answer(socket: Socket, data: { sessaoId: string; answer: RTCSessionDescriptionInit; }): void {
        this.signaling.forwardAnswer(socket, data);
    }

    iceCandidate(socket: Socket, data: { sessaoId: string; candidate: RTCIceCandidateInit; }): void {
        this.signaling.forwardIceCandidate(socket, data);
    }

    async heartbeat(socket: Socket, sessaoId: string): Promise<void> {
        const usuarioId = socket.data.usuario.id;
        await this.sessionRuntime.updateHeartbeat(sessaoId, usuarioId);
        await this.registrarPresencaSessaoUseCase.execute(sessaoId, usuarioId);
    }

    async endSession(socket: Socket, data: { sessaoId: string }): Promise<void> {
        await this.encerrarSessaoUseCase.execute({ sessaoId: data.sessaoId, usuarioId: socket.data.usuario.id });
        // await this.sessionRuntime.invalidateSession(data.sessaoId);
        this.signaling.emitSessionEnded({ sessaoId: data.sessaoId });
    }
}