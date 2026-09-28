// infrastructure/events/sessao/ParticipantOfflineHandler.ts

import { EventHandlerInterface } from "../../../domain/@shared/events/EventHandlerInterface";
import { ParticipantOffline } from "../../../domain/events/sessao/ParticipantOffline";
import { SignalingService } from "../../websocket/signaling/SignalingService";


export class ParticipantOfflineHandler implements EventHandlerInterface<ParticipantOffline> {
    
    constructor(

        private readonly signalingService : SignalingService
        
    ) {}

    async handle(event: ParticipantOffline): Promise<void> {
        
        console.log(
            `🔴 Evento de participante offline recebido: Sessão ${event.eventData.sessaoId}, Usuário ${event.eventData.usuarioId}`
        );
        
        const { sessaoId, usuarioId } = event.eventData;

        // this.io.to(sessaoId).emit("participant-offline", {
        //     usuarioId
        // });
        
        this.signalingService.emitParticipantOffline(sessaoId, usuarioId);
        
        console.log( `🔴 Participante ${usuarioId} offline` );
    }
}