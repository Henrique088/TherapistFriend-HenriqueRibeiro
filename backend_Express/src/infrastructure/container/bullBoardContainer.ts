// src/infrastructure/container/bullBoardContainer.ts

import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { Express } from 'express';
import { bullMQService } from './bullMQContainer';

export function setupBullBoard(app: Express) {

    const serverAdapter = new ExpressAdapter();
    
    serverAdapter.setBasePath('/bull/queues');

    // Cria a instância do Bull-Board

    const { addQueue } = createBullBoard({

        queues: bullMQService.getQueueAdapters(),
        
        serverAdapter: serverAdapter,
    
    });

    // Registra o callback no BullMQService para escutar novas filas
    
    bullMQService.setQueueCreatedCallback((adapter) => {
        
        addQueue(adapter);
    
    });

    // Registra a rota no Express
    
    app.use('/bull/queues', serverAdapter.getRouter());

    console.log('📊 Bull-Board configurado na rota: /bull/queues');
}

