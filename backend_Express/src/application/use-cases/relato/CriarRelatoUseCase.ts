// src/application/use-cases/relato/CriarRelatoUseCase.ts

import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { IQueueService } from '../../services/IQueueService';
import { RelatoEntity } from '../../../domain/entities/RelatoEntity';
import { CriarRelatoDTO } from '../../dtos/RelatoDTO';

export class CriarRelatoUseCase {
    constructor(
        private relatoRepository: IRelatoRepository,
        private queueService: IQueueService
    ) { }

    async execute(value: CriarRelatoDTO) {


        // Instanciar a Entidade com TODOS os campos obrigatórios
        const relato = new RelatoEntity({
            paciente_id: value.paciente_id,
            titulo: value.titulo,
            texto: value.texto,
            categoria: value.categoria,
            anonimo: value.anonimo,
            status: 'pendente',
            resultado_ia: 'pendente_analise',
            ids_profissionais_recusados: [],
            data_envio: new Date()
        });

        // Persistência
        const novoRelato = await this.relatoRepository.criar(relato);

        // Fila da IA
        try {
            await this.queueService.addJob(
                'ia-analise-geracao', // Nome da Fila (Queue)
                'analisar-gravidade', // Nome do Job (Ação específica)
                { relatoId: novoRelato.id, texto: novoRelato.texto }
            );
        } catch (error) {
            // Log de erro, mas não interrompe o fluxo
            console.error('Erro ao adicionar job na fila de IA:', error);
        }

        return novoRelato;
    }
}