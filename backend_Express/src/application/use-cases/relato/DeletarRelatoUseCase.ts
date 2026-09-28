// src/application/use-cases/relato/DeletarRelatoUseCase.ts

import { IRelatoRepository } from "../../../domain/repositories/IRelatoRepository";
import { DeletarRelatoDTO } from "../../dtos/RelatoDTO";
import AppError from "../../errors/AppError";


export class DeletarRelatoUseCase {
    constructor(private relatoRepository: IRelatoRepository) {}

    async execute({usuarioId, relatoId}: DeletarRelatoDTO ): Promise<void> {
        // Verificar se o relato existe e pertence ao usuário
        const relato = await this.relatoRepository.buscarPorId(relatoId);
        if (!relato) {
            throw new AppError('Relato não encontrado.', 404);
        }
        if (relato.paciente_id !== usuarioId) {
            throw new AppError('Ação não autorizada.', 403);
        }

        // Deletar o relato
        await this.relatoRepository.deletarRelato(usuarioId, relatoId);
    }
}