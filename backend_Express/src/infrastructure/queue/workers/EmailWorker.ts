// src/infrastructure/queue/workers/EmailWorker.ts

import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';
import { IEmailProvider } from '../../../domain/services/IEmailProvider';

export function setupEmailWorker(emailProvider: IEmailProvider) {
    const worker = new Worker('email-queue', async (job: Job) => {
        const { to, subject, body } = job.data;

        console.log(`[EmailWorker] Enviando e-mail para ${to}...`);

        try {
            await emailProvider.sendMail(to, subject, body);
            console.log(`[EmailWorker] E-mail enviado com sucesso para ${to}`);
        } catch (error) {
            console.error(`[EmailWorker] Erro no job ${job.id}:`, error);
            throw error; // Permite o Retry do BullMQ
        }
    }, { 
        connection: redisConnection,
        concurrency: 5 
    });

    worker.on('failed', (job, err) => {
        console.error(`[EmailWorker] Envio para ${job?.data.to} falhou permanentemente: ${err.message}`);
    });
}