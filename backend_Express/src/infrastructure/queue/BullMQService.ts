// src/infrastructure/queue/BullMQService.ts

import { Queue } from 'bullmq';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { IQueueService, QueueOptions, ScheduleJobOptions } from '../../application/services/IQueueService';
import { redisConnection } from '../config/redis';

export class BullMQService implements IQueueService {

    private queues: Map<string, Queue> = new Map();

    // Callback opcional para notificar quando uma fila for criada
    private onQueueCreated?: (adapter: BullMQAdapter) => void;

    // Permite registrar a função de escuta do BullBoard
    public setQueueCreatedCallback(callback: (adapter: BullMQAdapter) => void) {
        this.onQueueCreated = callback;
    }

    private getQueue(queueName: string): Queue {

        if (!this.queues.has(queueName)) {

            const newQueue = new Queue(queueName, { connection: redisConnection });

            this.queues.set(queueName, newQueue);

            // Notifica o listener (BullBoard) se ele tiver sido configurado
            if (this.onQueueCreated) {

                this.onQueueCreated(new BullMQAdapter(newQueue));
            }
        }

        return this.queues.get(queueName)!;
    }

    public getQueueAdapters(): BullMQAdapter[] {

        return Array.from(this.queues.values()).map(

            (queue) => new BullMQAdapter(queue)
        );
    }

    async addJob(

        queueName: string,

        jobName: string,

        data: any,
        
        options?: QueueOptions
    
    ): Promise<void> {

        const queue = this.getQueue(queueName);

        await queue.add(

            jobName,
            
            data,
            {
                delay: options?.delay ?? 0,
                attempts: options?.attempts ?? 3,
                backoff: {
                    type: "exponential",
                    delay: 1000
                }
            }
        );
    }

    async scheduleJob(
        
        queueName: string,
        
        jobName: string,
        
        data: any,
        
        options: ScheduleJobOptions
    ): Promise<void> {
        
        const queue = this.getQueue(queueName);

        await queue.upsertJobScheduler(
            
            `${queueName}:${jobName}`,
            {
                every: options.every
            },
            {
                name: jobName,
                data
            }
        );
    }
}