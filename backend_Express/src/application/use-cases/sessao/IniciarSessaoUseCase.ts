// src/application/use-cases/sessao/IniciarSessaoUseCase.ts

import AppError from "../../errors/AppError";

import { ISessaoRepository } from "../../../domain/repositories/ISessaoRepository";
import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";

export class IniciarSessaoUseCase {

    constructor(

        private readonly sessaoRepository: ISessaoRepository,

        private readonly runtimeService: ISessionRuntimeService

    ) {}

    async execute( sessaoId: string ): Promise<void> {
        console.log( `🎥 Iniciando sessão ${sessaoId}` );
        const sessao = await this.sessaoRepository.buscarPorId( sessaoId );

        if (!sessao) {

            throw new AppError( "Sessão não encontrada.", 404 );

        }

        /**
         * Já iniciou.
         */

        if (sessao.data_inicio_real) {

            return;

        }

        console.log( `🎥 Primeira Offer recebida (${sessaoId})` );

        await this.runtimeService.markSessionStarted( sessaoId );

        sessao.iniciarSessao();

        await this.sessaoRepository.atualizar( sessao );

        console.log( `✅ Sessão ${sessaoId} iniciada.` );

    }
}