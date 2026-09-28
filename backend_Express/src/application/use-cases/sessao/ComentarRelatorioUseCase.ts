// src/application/use-cases/sessao/ComentarRelatorioUseCase.ts

import { ISessionReportRepository } from "../../../domain/repositories/ISessionReportRepository";
import { ComentarioDTO } from "../../dtos/SessaoDTO";
import AppError from "../../errors/AppError";


export class ComentarRelatorioUseCase {
    constructor(
        private sessionReportRepository: ISessionReportRepository
    ){}

    async execute(dados: ComentarioDTO){

        const relatorio = await this.sessionReportRepository.buscarPorId(dados.sessaoId);

        if (!relatorio){
            throw new AppError('Relatório não encontrado', 404);
        }

        relatorio.editarComentario(dados.comentario, dados.profissionalId);

        return await this.sessionReportRepository.atualizarComentario(relatorio);

    }
}