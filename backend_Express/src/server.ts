// src/server.ts

import 'dotenv/config';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import { app, db } from "./interface/http/server";
import { TokenService } from './application/services/TokenService';
import { AuthenticatedSocket } from './interface/http/middlewares/verifySocketToken';
import { conversaRepository } from './infrastructure/container/repositoryContainer';

import { SocketManager } from './infrastructure/socket/SocketManager';
import { analisadorGrpcClient } from './infrastructure/container/grpcContainer';
import { eventDispatcher } from './infrastructure/container/eventContainer';
import { SessionHeartbeatScheduler } from './infrastructure/schedulers/SessionHeartbeatScheduler';
import { verificarTimeoutSessaoUseCase } from './infrastructure/container/useCaseContainer';
import { setupSignalingContainer } from './infrastructure/container/signalingContainer';
import { bootstrapDomainEvents } from './infrastructure/bootstrap/bootstrapDomainEvents';

const PORT: number = parseInt(process.env.PORT || '8000', 10);


const httpServer = createServer(app);

// 2. Inicializamos o Socket.io acoplado ao servidor HTTP
// const io = new Server(httpServer, {
//     cors: {
//         origin: process.env.NODE_ENV === 'development' ? '*' : process.env.FRONTEND_URL,
//         methods: ["GET", "POST"],
//         credentials: true
//     }
// });

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'http://192.168.15.135:3000',
        'https://hemolytic-bulgingly-kendall.ngrok-free.dev'
      ];

      // Permite sem origin (clientes nativos, apps, teste local)
      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }

      console.log(" Origin bloqueada no Socket.IO:", origin);

      return callback(new Error("Origin not allowed"));
    },
    credentials: true
  }
});

const tokenService = new TokenService();

setupSignalingContainer(io.of("/sessao-signaling"));
// Inicializa o serviço que contém as regras de negócio do socket
const socketManager = new SocketManager(
    io, 
    tokenService, 
    analisadorGrpcClient, 
    conversaRepository,
    eventDispatcher

);
socketManager.init();

// Configura eventos de domínio para usar as facilidades do socketManager
// setupDomainEvents(socketManager.ioInstance);
bootstrapDomainEvents(io);

io.on('connection', (socket: AuthenticatedSocket) => {
    const usuario = socket.data.usuario;

    if (usuario && usuario.id) {
        const roomName = `usuario_${usuario.id}`;
        socket.join(roomName);
        console.log(`🏠 Usuário ${usuario.id} autenticado e alocado na sala: ${roomName}`);
    }

    socket.on('disconnect', () => {

        console.log(`❌ Usuário ${socket.data.usuario?.id || socket.id} desconectado`);
    });
});

const scheduler = new SessionHeartbeatScheduler( verificarTimeoutSessaoUseCase );

scheduler.start();



async function startServer(): Promise<void> {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Conexão com o PostgreSQL estabelecida.');

        await db.sequelize.sync({ alter: true });
        // await db.sequelize.sync();
        console.log('🔄 Banco de dados sincronizado.');

        
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server + Socket.io running on port ${PORT}`);
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Falha crítica:', err.message);
        process.exit(1);
    }
}

startServer();