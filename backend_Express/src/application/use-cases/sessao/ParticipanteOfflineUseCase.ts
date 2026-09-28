// src/application/use-cases/sessao/ParticipanteOfflineUseCase.ts

import EventDispatcher from "../../../domain/@shared/events/EventDispatcher";

import { ParticipantOffline } from "../../../domain/events/sessao/ParticipantOffline";

import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";

import { ParticipanteOfflineDTO as DTO } from "../../dtos/SessaoDTO";

export class ParticipanteOfflineUseCase {

    constructor(

        private readonly runtime: ISessionRuntimeService,

        private readonly eventDispatcher: EventDispatcher

    ) {}

    async execute({ sessaoId, usuarioId }: DTO): Promise<void> {

        const participant = await this.runtime.getParticipantPresence( sessaoId, usuarioId );

        /**
         * Já estava offline.
         */
        if (!participant || !participant.online)
            return;

        await this.runtime.markOffline( sessaoId, usuarioId );

        this.eventDispatcher.notify(

            new ParticipantOffline({

                sessaoId,

                usuarioId

            })

        );

    }

}