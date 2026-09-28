// src/application/use-cases/sessao/GerarAcessoSessaoUseCase.ts

import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import AppError from '../../errors/AppError';
import { SessaoAcessoOutputDTO } from '../../dtos/SessaoDTO';
import { ITurnCredentialService } from "../../../domain/services/ITurnCredentialService";
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';
import { ITokenService } from '../../../domain/services/ITokenService';

export class GerarAcessoSessaoUseCase {
    constructor(
        private readonly sessaoRepository: ISessaoRepository,
        private readonly turnCredentialService: ITurnCredentialService,
        private readonly turnSessionService: ISessionRuntimeService,
        private readonly tokenService: ITokenService
    ) { }

    async execute(sessaoId: string, usuarioId: number, tipoUsuario: string): Promise<SessaoAcessoOutputDTO> {
        
        const sessao = await this.sessaoRepository.buscarPorId(sessaoId);

        if (!sessao) {
            throw new AppError("Sessão não encontrada.", 404);
        }

        // Validação de Segurança: Somente os participantes da sessão entram
        const eParticipante = sessao.paciente_id === usuarioId || sessao.profissional_id === usuarioId;

        if (!eParticipante) {
            throw new AppError("Você não tem permissão para acessar esta sessão.", 403);
        }

        if (sessao.status === 'finalizada' || sessao.status === 'cancelada') {
            throw new AppError("Esta sessão já foi encerrada.", 400);
        }

        const iceServers =
            await this.turnCredentialService.generateIceServers(
                sessaoId,
                usuarioId
            );

        const tokenSinalizacao =
            this.tokenService.gerarSignalingToken({

                sessaoId,

                usuarioId,

                tipoUsuario

            });

        await this.turnSessionService.registerCredential(
            sessaoId,
            usuarioId
        );

        console.log(`🎫 Token de signaling emitido para usuário ${usuarioId}` );


        return {
            sessaoId,
            iceServers,
            tokenSinalizacao
        };
    }
}