// src/worker.ts

import 'dotenv/config';
import db from './infrastructure/database';
import { registerAllWorkers } from './infrastructure/queue/workers';


async function startWorker() {
    try {
        await db.sequelize.authenticate();
        
        // Liga todos os motores de uma vez
        registerAllWorkers();

    } catch (error) {
        console.error('❌ Falha ao iniciar workers:', error);
        process.exit(1);
    }
}

startWorker();