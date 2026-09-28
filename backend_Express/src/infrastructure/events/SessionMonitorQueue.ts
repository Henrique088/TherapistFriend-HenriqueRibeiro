// // src/infrastructure/queues/session/SessionMonitorQueue.ts

// import { Queue } from "bullmq";

// import { redisConnection } from "../config/redis";

// export class SessionMonitorQueue { 
    
//     private readonly queue: Queue;

//     constructor() {

//         this.queue = new Queue(

//             "session-monitor",

//             {
//                 connection: redisConnection
//             }

//         );

//     }

//     async initialize(): Promise<void> {

//         /**
//          * Evita criar jobs duplicados.
//          */
//         await this.queue.upsertJobScheduler(

//             "session-monitor-scheduler",

//             {
//                 every: 5000
//             },

//             {
//                 name: "monitor-session-timeouts",

//                 data: {}
//             }

//         );

//         console.log("✅ SessionMonitorQueue inicializada.");

//     }

// }