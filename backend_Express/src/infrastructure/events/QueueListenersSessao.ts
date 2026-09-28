// src/infrastructure/events/QueueListenersSessao.ts

import { QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EventDispatcherInterface } from '../../domain/@shared/events/EventDispatcher';
import { SessaoIniciando } from '../../domain/events/sessao/SessaoIniciando';

export const setupSessaoQueueListeners = (eventDispatcher: EventDispatcherInterface) => {
    console.log('[SessaoQueueListeners] Iniciando monitoramento...');
    
    const queueEvents = new QueueEvents('sessao-queue', { 
        connection: redisConnection 
    });

    queueEvents.on('completed', ({ jobId, returnvalue }: any) => {
        console.log(`[SessaoQueueListeners] Job ${jobId} completado:`, returnvalue);

        // Verifica se é um job do tipo sessão
        if (returnvalue?.jobType === 'sessao-iniciando') {
            console.log(`[SessaoQueueListeners] Processando evento para agendamento ${returnvalue.agendamentoId}`);
            
            try {
                // Cria o evento de domínio
                const event = new SessaoIniciando({
                    usuarios: returnvalue.usuarios,
                    mensagem: returnvalue.mensagem,
                    horaInicio: returnvalue.horaInicio,
                    link: returnvalue.link,
                    agendamentoId: returnvalue.agendamentoId,
                    nomePaciente: returnvalue.nomePaciente,
                    nomeProfissional: returnvalue.nomeProfissional
                });

                // DISPARA O EVENTO AQUI (no processo principal)
                // Este eventDispatcher TEM os handlers registrados!
                eventDispatcher.notify(event);
                
                console.log(`[SessaoQueueListeners] Evento disparado para agendamento ${returnvalue.agendamentoId}`);
            } catch (error) {
                console.error('[SessaoQueueListeners] Erro ao processar evento:', error);
            }
        }
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
        console.error(`[SessaoQueueListeners] Job ${jobId} falhou:`, failedReason);
    });

    console.log("[SessaoQueueListeners] Monitorando eventos de conclusão da fila de sessão...");
};