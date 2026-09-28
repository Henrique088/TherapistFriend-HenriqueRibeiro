// src/infrastructure/queue/workers/IAWorker.ts

import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';
import { IIAnalisarGravidade } from '../../../domain/services/IIAAnalisarGravidade';
import { IIACardsService } from '../../../domain/services/IIACardsService';


export function setupIAWorker(iaAnalisarGravidade: IIAnalisarGravidade, iaCardsService: IIACardsService) {
    const worker = new Worker('ia-analise-geracao', async (job: Job) => {
        switch (job.name) {
            case 'analisar-gravidade' :
                return  await iaAnalisarGravidade.gravidade(job.data);

            case 'gerar-cards' :
                return await iaCardsService.gerarCardsMood(job.data)
        }
    }, { 
        connection: redisConnection,
        concurrency: 5 // Permite processar até 5 jobs simultaneamente
    });

    worker.on('failed', (job, err) => {
        if (job?.name === 'analisar-gravidade') {
            console.error(`[IAWorker] Análise de gravidade para relato ${job?.data.relatoId} falhou permanentemente: ${err.message}`);
        } else if (job?.name === 'gerar-cards') {
            console.error(`[IAWorker] Geração de cards para usuário ${job?.data.usuarioId} falhou permanentemente: ${err.message}`);
        } else {
            console.error(`[IAWorker] Job ${job?.name} falhou permanentemente: ${err.message}`);
        }
    });
}