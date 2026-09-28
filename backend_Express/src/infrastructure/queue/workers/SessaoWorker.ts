// src/infrastructure/queue/workers/SessaoWorker.ts

import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';

export function setupSessaoWorker() {
    const worker = new Worker('sessao-queue', async (job: Job) => {
        const { agendamentoId, pacienteId, profissionalId, horaInicio, link, nomePaciente, nomeProfissional } = job.data;

        console.log(`[SessaoWorker] Processando lembrete para agendamento ${agendamentoId}...`);

        try {
            // APENAS processa e RETORNA os dados, disparar o evento direto não da certo pois como o worker está rodando em outro processo a
            // instância dos handlers vem vazio
           
            console.log(`[SessaoWorker] Lembrete processado para agendamento ${agendamentoId}`);
            
            // RETORNA os dados para o QueueEvents processar
            return {
                jobType: 'sessao-iniciando',
                usuarios: [pacienteId, profissionalId],
                mensagem: `Sua sessão começa em 10 minutos!`,
                horaInicio,
                link,
                agendamentoId,
                nomePaciente,
                nomeProfissional
            };
            
        } catch (error) {
            console.error(`[SessaoWorker] Erro no job ${job.id}:`, error);
            throw error; 
        }
    }, { 
        connection: redisConnection,
        concurrency: 10 
    });

    worker.on('failed', (job, err) => {
        console.error(`[SessaoWorker] Falha no lembrete do agendamento ${job?.data.agendamentoId}: ${err.message}`);
    });

    return worker;
}