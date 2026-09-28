// src/infrastructure/queues/workers/DisconnectTimeoutWorker.ts

import { Worker, Job } from "bullmq";

import { redisConnection } from "../../config/redis";

import { DisconnectTimeoutUseCase } from "../../../application/use-cases/sessao/DisconnectTimeoutUseCase";

interface DisconnectTimeoutJob {

    sessaoId: string;
}

export const setupDisconnectTimeoutWorker = ( 
    disconnectTimeoutUseCase: DisconnectTimeoutUseCase ) => {

    const worker = new Worker( "session-timeout", async (job: Job<DisconnectTimeoutJob>) => {

            const { sessaoId } = job.data;

            console.log( `⏳ Verificando timeout da sessão ${sessaoId}`);

            try {

                await disconnectTimeoutUseCase.execute({ sessaoId });

            } catch (err) {

                console.error("[DisconnectTimeoutWorker]", err );

                throw err;
            }

        },

        {

            connection: redisConnection
        }

    );

    worker.on( "completed", job => {

            console.log( `✅ Timeout processado para ${job.data.sessaoId}`);

        }

    );

    worker.on( "failed", (job, err) => {

            console.error( `[DisconnectTimeoutWorker] Sessão ${job?.data.sessaoId} falhou: ${err.message}` );

        }

    );

};