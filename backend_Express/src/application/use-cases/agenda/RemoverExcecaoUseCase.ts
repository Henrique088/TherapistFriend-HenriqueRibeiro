// src/application/use-cases/agenda/RemoverExcecaoUseCase.ts

import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import AppError from '../../errors/AppError';
import { RemoverExcecaoDTO } from '../../dtos/AgendaDTO';


export class RemoverExcecaoUseCase {
    constructor(private bloqueioRepository: IBloqueioRepository) { }

    async execute(dados: RemoverExcecaoDTO): Promise<void> {

       const bloqueio = await this.bloqueioRepository.buscarPorId(dados.bloqueioId);

        if (!bloqueio) {
            throw new AppError("Bloqueio de agenda não encontrado.", 404);
        }

        if (bloqueio.profissionalId !== dados.profissionalId) {
            throw new AppError("O bloqueio não pertence ao profissional especificado.", 403);
        }

        await this.bloqueioRepository.excluirExcecao(dados.excecaoId);
    }
}