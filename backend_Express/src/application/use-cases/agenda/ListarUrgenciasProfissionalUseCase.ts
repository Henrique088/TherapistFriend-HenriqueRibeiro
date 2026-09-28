// src/application/use-cases/agenda/ListarUrgenciasProfissionalUseCase.ts

import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';

export interface ListarUrgenciasResponse {
    pendentes: UrgenciaEntity[];
    naFila: UrgenciaEntity[];
}

export class ListarUrgenciasProfissionalUseCase {
    constructor(private urgenciaRepository: IUrgenciaRepository) {}

    async execute(profissionalId: number): Promise<ListarUrgenciasResponse> {
        // Busca todas as urgências que ainda não foram concluídas ou rejeitadas
        // (Isso inclui as 'pendente_aprovacao' e 'aprovada_aguardando_vaga')
        const todasUrgencias = await this.urgenciaRepository.listarAtivasPorProfissional(profissionalId);

        // Separa por grupos para facilitar a vida do Frontend
        const pendentes = todasUrgencias.filter(u => u.status === 'pendente_aprovacao');
        const naFila = todasUrgencias.filter(u => u.status === 'aprovada_aguardando_vaga');

        return {
            pendentes,
            naFila
        };
    }
}