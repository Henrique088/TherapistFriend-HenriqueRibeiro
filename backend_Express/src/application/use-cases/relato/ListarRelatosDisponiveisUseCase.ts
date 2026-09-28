// src/application/use-cases/relato/ListarRelatosDisponiveisUseCase.ts

import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { ListarRelatosDTO, ListarResponseDTO } from '../../dtos/RelatoDTO';

export class ListarRelatosDisponiveisUseCase {
    constructor(
        private relatoRepository: IRelatoRepository
    ) { }

    async execute({ profissionalId, page, limit, gravidade, busca }: ListarRelatosDTO) {
        // Garante que os números são válidos
        const currentPage = Math.max(1, page);
        const currentLimit = Math.max(1, limit);

        const { dados, total } = await this.relatoRepository.listarDisponiveis(
            profissionalId,
            currentPage,
            currentLimit,
            { gravidade, busca }
        );

        const paginasTotais = Math.ceil(total / currentLimit);

        const relatosDTO: ListarResponseDTO[] = dados.map(relatoEntity => ({
            id: relatoEntity.id,
            paciente_id: relatoEntity.paciente_id,
            titulo: relatoEntity.titulo,
            texto: relatoEntity.texto,
            categoria: relatoEntity.categoria,
            profissionalId: relatoEntity.profissional_id? true: false,
            resultado_ia: relatoEntity.resultado_ia || '',
            data_envio: relatoEntity.data_envio,
            quantidadeLikes: relatoEntity.quantidadeLikes || 0,
            jaCurtiu: relatoEntity.jaCurtiu, 
            codinomePaciente: relatoEntity.codinomePaciente || 'Anônimo'
        }));

        return {
            dados: relatosDTO,
            total,
            paginaAtual: currentPage,
            paginasTotais
        };
    }
}