// src/infrastructure/events/QueueRelatorioSessao.ts

import { QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EventDispatcherInterface } from '../../domain/@shared/events/EventDispatcher';
import { RelatorioSessaoGerado } from "../../domain/events/analysis/RelatorioSessaoGerado"; // Padronizado


export const setupRelatorioQueueListeners = (eventDispatcher: EventDispatcherInterface) => {
    console.log('[RelatorioQueueListeners] Iniciando monitoramento...');
    
    const queueEvents = new QueueEvents('analise-sessao', { 
        connection: redisConnection 
    });

    queueEvents.on('completed', ({ jobId, returnvalue }: any) => {
        console.log(`[RelatorioQueueListeners] Job ${jobId} completado:`, returnvalue);

        // Verifica se é um job do tipo sessão
        if (returnvalue?.jobType === 'gerar-relatorio') {
            
            
            try {
                // Cria o evento de domínio
                eventDispatcher.notify(
                new RelatorioSessaoGerado({
                    sessaoId: returnvalue.sessaoId,
                    pacienteId: returnvalue.pacienteId,
                    profissionalId: returnvalue.profissionalId,
                    summary: returnvalue.summary
                })
            );
                
                console.log(`[SessaoQueueListeners] Evento disparado para sessão ${returnvalue.sessaoId}`);
            } catch (error) {
                console.error('[SessaoQueueListeners] Erro ao processar evento:', error);
            }
        }
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
        console.error(`[RelatorioQueueListeners] Job ${jobId} falhou:`, failedReason);
    });

    console.log("[RelatorioQueueListeners] Monitorando eventos de conclusão da fila de relatorio...");
};