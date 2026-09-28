// src/application/use-cases/sessao/DisconnectTimeoutUseCase.ts

import AppError from "../../errors/AppError";
import { ISessaoRepository } from "../../../domain/repositories/ISessaoRepository";
import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";
import { EncerrarSessaoUseCase } from "./EncerrarSessaoUseCase";

interface DisconnectTimeoutDTO {

    sessaoId: string;

}

export class DisconnectTimeoutUseCase {

    constructor(

        private readonly sessaoRepository: ISessaoRepository,

        private readonly encerrarSessaoUseCase: EncerrarSessaoUseCase

    ) {}

    async execute({ sessaoId }: DisconnectTimeoutDTO): Promise<void> {

        console.log( `⏳ Verificando timeout da sessão ${sessaoId}` );

        const sessao = await this.sessaoRepository.buscarPorId( sessaoId );

        if (!sessao) {

            throw new AppError( "Sessão não encontrada.", 404);

        }

        if (sessao.status === "finalizada" || sessao.status === "cancelada" ) {

            console.log( "Sessão já encerrada.");

            return;

        }

        // const onlineCount = await this.turnSessionService.getOnlineCount( sessaoId );

        // if (onlineCount > 0) {

        //     console.log( `${onlineCount} participante(s) voltou(aram).` );

        //     return;

        // }

        console.log( "Nenhum participante voltou. Encerrando sessão." );

        await this.encerrarSessaoUseCase.execute({ sessaoId, usuarioId: sessao.profissional_id });

    }

}