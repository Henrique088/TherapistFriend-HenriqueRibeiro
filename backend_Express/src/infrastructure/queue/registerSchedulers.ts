// src/infrastructure/queue/registerSchedulers.ts

import { IQueueService } from "../../application/services/IQueueService";

export async function registerSchedulers( queueService: IQueueService ): Promise<void> {

    await queueService.scheduleJob(

        "session",

        "monitor-timeouts",

        {},

        {

            every: 5000

        }

    );

    console.log("✅ Scheduler monitor-timeouts registrado.");

}