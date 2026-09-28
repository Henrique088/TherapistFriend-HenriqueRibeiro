// src/infrastructure/events/sessao/SessionFinishedHandler.ts

import { EventHandlerInterface } from "../../../domain/@shared/events/EventHandlerInterface";

import { SessionFinished } from "../../../domain/events/sessao/SessionFinished";

import { IQueueService } from "../../../application/services/IQueueService";

import { SignalingService } from "../../websocket/signaling/SignalingService";

export class SessionFinishedHandler implements EventHandlerInterface<SessionFinished> {

    constructor(

        private readonly queue: IQueueService,
        private readonly signalingService: SignalingService

    ) { }

    async handle(event: SessionFinished): Promise<void> {

        const {

            sessaoId,

            pacienteId,

            profissionalId,

            elegivelParaRelatorio

        } = event.eventData;

        if (!elegivelParaRelatorio) {

            // console.log(`⚠️ Sessão ${sessaoId} não é elegível para gerar relatório.`);

            // console.log(`Dados enviados:  sessaoId: ${sessaoId}, pacienteId: ${pacienteId}, profissionalId: ${profissionalId}, elegivelParaRelatorio: ${elegivelParaRelatorio}`);

            this.signalingService.emitSessionEnded(
                { sessaoId: sessaoId },
                {
                    sessaoId: sessaoId,
                    tipo: 'INFO_SESSAO',
                    elegivelParaRelatorio: !!elegivelParaRelatorio
                }
            );

            return;

        } else {

            this.signalingService.emitSessionEnded(
                { sessaoId: sessaoId },
                {
                    sessaoId: sessaoId,
                    tipo: 'INFO_SESSAO',
                    elegivelParaRelatorio: !!elegivelParaRelatorio
                }
            );
           
        }
        await this.queue.addJob(

            "analise-sessao",

            "gerar-relatorio",

            {

                sessaoId,

                pacienteId,

                profissionalId

            }

        );

        console.log(`📄 Relatório da sessão ${sessaoId} agendado.`);

    }

}