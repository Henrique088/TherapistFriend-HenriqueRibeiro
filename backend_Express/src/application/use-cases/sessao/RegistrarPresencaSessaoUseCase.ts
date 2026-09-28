// src/application/use-cases/sessao/RegistrarPresencaSessaoUseCase.ts

import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";

export class RegistrarPresencaSessaoUseCase {

    constructor(

        private readonly runtime: ISessionRuntimeService

    ) { }

    async execute( sessaoId: string, usuarioId: number ): Promise<void> {

        console.log( "➡️ UseCase heartbeat", sessaoId, usuarioId );

        const presence = await this.runtime.getParticipantPresence( sessaoId, usuarioId );

        if (!presence) {

            await this.runtime.registerPresence( sessaoId, usuarioId );

            return;

        }

        await this.runtime.updateHeartbeat( sessaoId, usuarioId );

    }

}