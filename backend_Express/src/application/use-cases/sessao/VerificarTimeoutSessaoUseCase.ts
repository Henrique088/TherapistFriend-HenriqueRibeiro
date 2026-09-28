// src/application/use-cases/sessao/VerificarTimeoutSessaoUseCase.ts

import EventDispatcher from "../../../domain/@shared/events/EventDispatcher";
import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";
import { SessionTimeout } from "../../../domain/events/sessao/SessionTimeout";
import { ParticipantOffline } from "../../../domain/events/sessao/ParticipantOffline";

export class VerificarTimeoutSessaoUseCase {

    private readonly TIMEOUT_MS = 30_000;

    constructor(

        private readonly sessionRuntime: ISessionRuntimeService,

        private readonly eventDispatcher: EventDispatcher

    ) { }

    async execute(): Promise<void> {

        const sessoes = await this.sessionRuntime.getActiveSessions();

        for (const sessaoId of sessoes) {

            await this.processSession(sessaoId);

        }

    }

    private async processSession( sessaoId: string ): Promise<void> {

        console.log( `⏳ Verificando timeout da sessão ${sessaoId}` );

        const participantes = await this.sessionRuntime.getPresence(sessaoId);

        const now = Date.now();

        for (const participante of participantes) {

            if (!participante.online)
                continue;

            const expired = now - participante.heartbeat > this.TIMEOUT_MS;

            console.log("Expirado: ", expired, "Participante: ", participante.usuarioId, "Sessão: ", sessaoId);

            if (!expired)
                continue;
            console.log('Marcando participante como offline:', participante.usuarioId, 'na sessão:', sessaoId);

            await this.sessionRuntime.markOffline( sessaoId, participante.usuarioId );

            console.log('Notificando evento de participante offline:', participante.usuarioId, 'na sessão:', sessaoId);

            this.eventDispatcher.notify(

                new ParticipantOffline({

                    sessaoId,

                    usuarioId: participante.usuarioId

                })

            );

        }

        const remaining = await this.sessionRuntime.getPresence(sessaoId);

        const someoneOnline = remaining.some( participant => participant.online );

        if (someoneOnline)
            return;

        this.eventDispatcher.notify(

            new SessionTimeout({

                sessaoId

            })

        );

    }
}