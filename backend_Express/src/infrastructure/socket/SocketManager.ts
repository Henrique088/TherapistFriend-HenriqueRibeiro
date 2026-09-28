// src/infrastructure/socket/SocketManager.ts

import { Server } from 'socket.io';
import { ITokenService } from '../../domain/services/ITokenService';
import { verifySocketToken, AuthenticatedSocket } from '../../interface/http/middlewares/verifySocketToken';
import { SessaoAnalysisGateway } from '../gateways/SessaoAnalysisGateway';
import { IAnalisadorGrpcClient } from '../../domain/services/analysis/IAnalisadorGrpcClient';
import { IConversaRepository } from '../../domain/repositories/IConversaRepository';
import { EventDispatcherInterface } from '../../domain/@shared/events/EventDispatcher';
import { SessaoModuleFactory } from '../factories/SessaoModuleFactory';

export class SocketManager {
    constructor(

        private io: Server,
        private tokenService: ITokenService,
        private grpcClient: IAnalisadorGrpcClient,
        private conversaRepository: IConversaRepository,
        private eventDispatcher: EventDispatcherInterface
    ) {}

    public init(): void {

        // 1. Middleware de Autenticação Global (Namespace "/")
        this.io.use(verifySocketToken(this.tokenService));

        // 2. Configura os Namespaces específicos (Isolamento de tráfego)
        this.setupSignalingNamespace();

        this.setupAnalysisNamespace();

        // 3. Configura o Namespace Padrão (Chat e Notificações)
        this.setupDefaultNamespace();

        console.log('🔌 Socket.io: Todos os Namespaces e Gateways inicializados.');
    }

    public get ioInstance(): Server {

        return this.io;
    }

    private setupDefaultNamespace() {

        this.io.on('connection', (socket: AuthenticatedSocket) => {

            const usuario = socket.data.usuario;

            if (usuario?.id) {

                // Sala privativa do usuário para notificações globais
                socket.join(`usuario_${usuario.id}`);

                console.log(`🏠 Usuário ${usuario.id} conectado ao Chat/Global.`);
            }

            // Lógica do Chat 
            socket.on('join_conversa', async (conversaId: number) => {

                const conversa = await this.conversaRepository.buscarPorId(conversaId);

                if (conversa && (conversa.pacienteId === usuario?.id || conversa.profissionalId === usuario?.id)) {

                    socket.join(`conversa_${conversaId}`);

                    console.log(`💬 Acesso à conversa ${conversaId} autorizado para ${usuario?.id}`);

                } else {

                    socket.emit('error_chat', 'Acesso negado à conversa');
                }
            });

            socket.on('disconnect', () => {

                console.log(`❌ Usuário ${usuario?.id} desconectado.`);

            });
        });
    }

    private setupSignalingNamespace() {

        const nsp = this.io.of('/sessao-signaling');

        nsp.use(verifySocketToken(this.tokenService));

        SessaoModuleFactory.create(nsp);

    }

    private setupAnalysisNamespace() {

        const nsp = this.io.of('/sessao-analysis');

        nsp.use(verifySocketToken(this.tokenService));

        new SessaoAnalysisGateway(nsp, this.grpcClient, this.eventDispatcher);

    }

    // Métodos para Use Cases dispararem eventos via Socket (Inversão de Dependência)
    public emitirParaUsuario(usuarioId: number, evento: string, dados: any) {

        this.io.to(`usuario_${usuarioId}`).emit(evento, dados);

    }

    public emitirParaConversa(conversaId: number, evento: string, dados: any) {

        this.io.to(`conversa_${conversaId}`).emit(evento, dados);
        
    }
}