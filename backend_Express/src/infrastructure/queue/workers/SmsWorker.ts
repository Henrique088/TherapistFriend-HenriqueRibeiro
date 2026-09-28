// src/infrastructure/queue/workers/SmsWorker.ts

import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';
import { ISmsProvider } from '../../../domain/services/ISmsProvider';

export function setupSmsWorker(smsProvider: ISmsProvider) {
    const worker = new Worker('sms-queue', async (job: Job) => {
        const { to, message } = job.data;

        console.log(`[SmsWorker] Enviando SMS para ${to}...`);

        try {
            await smsProvider.sendSms(to, message);
            console.log(`[SmsWorker] SMS enviado com sucesso para ${to}`);
        } catch (error) {
            console.error(`[SmsWorker] Erro no job ${job.id}:`, error);
            throw error;
        }
    }, { 
        connection: redisConnection,
        concurrency: 2 // Menor concorrência para SMS por limites de operadora
    });

    worker.on('failed', (job, err) => {
        console.error(`[SmsWorker] SMS para ${job?.data.to} falhou permanentemente: ${err.message}`);
    });
}