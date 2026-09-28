// src/application/use-cases/sessao/EntrarSessaoUseCase.ts

import AppError from "../../errors/AppError";

import { ISessaoRepository } from "../../../domain/repositories/ISessaoRepository";
import { ISessionRuntimeService } from "../../../domain/services/ISessionRuntimeService";

import { EntrarSessaoDTO, EntrarSessaoResult } from "../../dtos/SessaoDTO";

import { RegistrarPresencaSessaoUseCase } from "./RegistrarPresencaSessaoUseCase";



export class EntrarSessaoUseCase {

    constructor(

        private readonly sessaoRepository: ISessaoRepository,

        private readonly sessionRuntimeService: ISessionRuntimeService,

    ) { }

    async execute({ sessaoId, usuarioId }: EntrarSessaoDTO): Promise<EntrarSessaoResult> {

        const sessao = await this.sessaoRepository.buscarPorId(sessaoId);

        if (!sessao) {

            throw new AppError( "Sessão não encontrada.", 404 );

        }

        const participants = await this.sessionRuntimeService.getPresence(sessaoId);

        const participantesOnline  = participants.filter( participant => participant.online ).length;

        console.log( `🟢 Usuário ${usuarioId} entrou na sessão ${sessaoId}` );
        

        return { participantesOnline };
        
    }

}