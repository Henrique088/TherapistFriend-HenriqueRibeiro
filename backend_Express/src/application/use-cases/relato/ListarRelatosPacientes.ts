// src/application/use-cases/relato/ListarRelatosDisponiveisUseCase.ts

import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { ListarRelatosPacienteDTO, ListarParaPacienteResponseDTO } from '../../dtos/RelatoDTO';

export class ListarRelatosPacientesUseCase {
    constructor(
        private relatoRepository: IRelatoRepository
    ) { }

    async execute({ pacienteId, page, limit, busca }: ListarRelatosPacienteDTO) {
        // Garante que os números são válidos
        const currentPage = Math.max(1, page);
        const currentLimit = Math.max(1, limit);

        const { dados, total } = await this.relatoRepository.listarRelatosparaPaciente(
            pacienteId,
            currentPage,
            currentLimit,
            {busca}
        );

        const paginasTotais = Math.ceil(total / currentLimit);

        const relatosDTO: ListarParaPacienteResponseDTO[] = dados.map(relatoEntity => ({
                    id: relatoEntity.id,
                    paciente_id: relatoEntity.paciente_id,
                    titulo: relatoEntity.titulo,
                    categoria: relatoEntity.categoria,
                    texto: relatoEntity.texto,
                    data_envio: relatoEntity.data_envio,
                    quantidadeLikes: relatoEntity.quantidadeLikes || 0,
                    jaCurtiu: relatoEntity.jaCurtiu, 
                    codinomePaciente: relatoEntity.codinomePaciente || 'Anônimo'
                }));

//          const multiplicador = 20;

// // Método conciso
// const relatosMultiplicados = [...Array(multiplicador)]
//     .reduce(acc => [...acc, ...relatosDTO], []);       

        return {
            dados : relatosDTO,
            total,
            paginaAtual: currentPage,
            paginasTotais
        };
    }
}