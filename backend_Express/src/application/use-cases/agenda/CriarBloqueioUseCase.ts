// src/application/use-cases/agenda/CriarBloqueioUseCase.ts

import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { BloqueioEntity } from '../../../domain/entities/BloqueioEntity';
import AppError from '../../errors/AppError';
import { CriarBloqueioDTO } from '../../dtos/AgendaDTO';



export class CriarBloqueioUseCase {
    constructor(private bloqueioRepository: IBloqueioRepository) {}

    async execute(dados: CriarBloqueioDTO): Promise<BloqueioEntity> {
        // Validação: dataFim não pode ser menor que dataInicio
        if (dados.dataFim < dados.dataInicio) {
            throw new AppError("A data de término não pode ser anterior ao início.", 400);
        }

        const bloqueio = new BloqueioEntity({
            profissionalId: dados.profissionalId,
            titulo: dados.titulo,
            dataInicio: dados.dataInicio,
            dataFim: dados.dataFim,
            recorrente: dados.recorrente,
            diasSemana: dados.diasSemana,
            ativo: true
        });

        return await this.bloqueioRepository.salvar(bloqueio);
    }
}