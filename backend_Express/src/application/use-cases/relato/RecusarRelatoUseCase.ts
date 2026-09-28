// src/application/use-cases/relato/RecusarRelatoUseCase.ts

import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import AppError from '../../errors/AppError';
import { RecusarRelatosDTO } from '../../dtos/RelatoDTO';

export class RecusarRelatoUseCase {
    constructor(
        private relatoRepository: IRelatoRepository
    ) { }

    async execute({ relatoId, profissionalId }: RecusarRelatosDTO) {

        const relato = await this.relatoRepository.buscarPorId(relatoId);

        if (!relato) {
            throw new AppError('Relato não encontrado', 404);
        }
        // Adiciona o profissional à lista de recusas, se ainda não estiver nela
        if (!relato.ids_profissionais_recusados.includes(profissionalId)) {
            relato.ids_profissionais_recusados.push(profissionalId);
        }

        // Se o profissional que está recusando era quem estava vinculado (desistência), 
        // limpa o vínculo e volta para pendente
        if (relato.profissional_id === profissionalId) {
            relato.recusaRelato();
        }

        // Atualiza o relato no repositório
        await this.relatoRepository.registrarRecusa(relatoId, profissionalId);

        return relato;
    }
}