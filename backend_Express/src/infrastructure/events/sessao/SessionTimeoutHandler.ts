// infrastructure/events/sessao/SessionTimeoutHandler.ts

import { EventHandlerInterface } from "../../../domain/@shared/events/EventHandlerInterface";
import { SessionTimeout } from "../../../domain/events/sessao/SessionTimeout";
import { EncerrarSessaoUseCase } from "../../../application/use-cases/sessao/EncerrarSessaoUseCase";
import { SignalingService } from "../../websocket/signaling/SignalingService";

export class SessionTimeoutHandler implements EventHandlerInterface<SessionTimeout> {

    constructor(

        private readonly signaling: SignalingService,

        private readonly encerrarSessao: EncerrarSessaoUseCase,

    ) {}

    async handle(event: SessionTimeout) {

        const { sessaoId } = event.eventData;

        console.log( `⏰ Timeout da sessão ${sessaoId}` );

        await this.encerrarSessao.executeAutomatico( sessaoId );

        this.signaling.finishSession(sessaoId);

    }

}