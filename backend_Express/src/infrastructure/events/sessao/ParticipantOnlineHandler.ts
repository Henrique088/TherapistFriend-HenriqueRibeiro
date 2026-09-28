// infrastructure/events/sessao/ParticipantOnlineHandler.ts

import { EventHandlerInterface } from "../../../domain/@shared/events/EventHandlerInterface";
import { ParticipantOnline } from "../../../domain/events/sessao/ParticipantOnline";
import { SignalingService } from "../../websocket/signaling/SignalingService";

export class ParticipantOnlineHandler implements EventHandlerInterface<ParticipantOnline> {

    constructor( private readonly signalingService : SignalingService ) {}

    async handle(event: ParticipantOnline): Promise<void> {

        const { sessaoId, usuarioId } = event.eventData;

        this.signalingService.emitParticipantOnline(sessaoId, usuarioId);

        console.log( `🟢 Participante ${usuarioId} voltou para a sessão ${sessaoId}` );
    }

}