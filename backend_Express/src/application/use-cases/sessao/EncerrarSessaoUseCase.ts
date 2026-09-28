// src/application/use-cases/sessao/EncerrarSessaoUseCase.ts

import { EncerrarSessaoDTO } from "../../dtos/SessaoDTO";
import AppError from "../../errors/AppError";

import EventDispatcher from "../../../domain/@shared/events/EventDispatcher";

import { SessionFinished } from "../../../domain/events/sessao/SessionFinished";

import { ISessaoRepository } from "../../../domain/repositories/ISessaoRepository";
import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";

import { SessaoEntity } from "../../../domain/entities/SessaoEntity";

export class EncerrarSessaoUseCase {

    constructor(

        private readonly sessaoRepository: ISessaoRepository,

        private readonly sessionRuntimeService: ISessionRuntimeService,

        private readonly eventDispatcher: EventDispatcher

    ) { }

    /**
     * ==================================================
     * Encerramento manual
     * ==================================================
     */

    async execute( dados: EncerrarSessaoDTO ): Promise<void> {

        const sessao = await this.sessaoRepository.buscarPorId( dados.sessaoId );

        if (!sessao) {

            throw new AppError( "Sessão não encontrada.", 404 );

        }

        if (sessao.profissional_id !== dados.usuarioId) {

            throw new AppError( "Você não possui permissão para encerrar esta sessão.", 403 );

        }

        await this.finalizar(sessao);

    }

    /**
     * ==================================================
     * Encerramento automático
     * ==================================================
     */

    async executeAutomatico( sessaoId: string ): Promise<void> {

        const sessao = await this.sessaoRepository.buscarPorId( sessaoId );

        if (!sessao)
            return;

        await this.finalizar(sessao);

    }

    /**
     * ==================================================
     * Fluxo único
     * ==================================================
     */

    private async finalizar( sessao: SessaoEntity ): Promise<void> {

        /**
         * Idempotência
         */

        if (sessao.status === "finalizada") {

            console.log( `[Sessão] ${sessao.id} já estava encerrada.` );

            return;

        }

        /**
         * Persistência
         */

        await this.sessaoRepository.encerrarSessao( sessao );

        /**
         * Runtime
         */
 
        await this.sessionRuntimeService.invalidateSession( sessao.id );

        /**
        * Domínio
        */

            const elegivelParaRelatorio = sessao.verficiarTempoRelatorio();

            /**
        * Evento de domínio
        */

            this.eventDispatcher.notify(

                new SessionFinished({

                    sessaoId: sessao.id,

                    pacienteId: sessao.paciente_id,

                    profissionalId: sessao.profissional_id,

                    elegivelParaRelatorio: elegivelParaRelatorio

                })

            );
            
        

        console.log("Elegivel: ", elegivelParaRelatorio)

        console.log( `[UseCase] Sessão ${sessao.id} encerrada.` );

    }

}