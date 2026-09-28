// src/infrastructure/queue/workers/SessionMonitorWorker.ts

import { Worker } from "bullmq";

import { redisConnection } from "../../config/redis";

import { VerificarTimeoutSessaoUseCase } from "../../../application/use-cases/sessao/VerificarTimeoutSessaoUseCase";

export class SessionMonitorWorker {

    constructor(

        private readonly verificarTimeoutSessaoUseCase: VerificarTimeoutSessaoUseCase

    ) {

        this.start();

    }

    private start(): void {

        new Worker(

            "session",

            async job => {

                console.log(
                    "📥 Job recebido:",
                    job.name,
                    job.id,
                    job.data
                );

                if (job.name !== "monitor-timeouts") {

                    console.log("⚠️ Job ignorado:", job.name);
                    return;
                }

                try {
                    console.log("📥 Job recebido:", job.name);

                    await this.verificarTimeoutSessaoUseCase.execute();

                    console.log("✅ UseCase finalizado");

                } catch (err) {

                    console.error("❌ Erro no Worker:", err);
                }

            },

            {

                connection: redisConnection,

                concurrency: 1

            }

        );

        console.log("✅ SessionMonitorWorker iniciado.");

    }

}