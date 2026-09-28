// import { createBullBoard } from '@bull-board/api';
// import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
// import { ExpressAdapter } from '@bull-board/express';
// import { Queue } from 'bullmq';
// import { redisConnection } from '../config/redis';

// // 1. Criar adaptador Express
// const serverAdapter = new ExpressAdapter();

// // 2. Criar instâncias das suas filas
// const iaProcessingQueue = new Queue('ia-processing', { connection: redisConnection });
// const notificationsQueue = new Queue('notifications', { connection: redisConnection });
// // Adicione outras filas conforme necessário

// // 3. Configurar o BullBoard
// createBullBoard({
//   queues: [
//     new BullMQAdapter(iaProcessingQueue),
//     new BullMQAdapter(notificationsQueue)
//   ],
//   serverAdapter: serverAdapter,
// });

// // 4. Definir o caminho base
// serverAdapter.setBasePath('/admin/queues');

// export { serverAdapter };