// src/infrastructure/gateways/SessaoAnalysisGateway.ts

import { Namespace, Socket } from 'socket.io';
import { IAnalisadorGrpcClient } from '../../domain/services/analysis/IAnalisadorGrpcClient';
import { EventDispatcherInterface } from '../../domain/@shared/events/EventDispatcher';
import { FrameAnalisadoIA } from '../../domain/events/analysis/FrameAnalisadoIA';

export class SessaoAnalysisGateway {
    private processingSockets = new Set<string>();
    private readonly GRPC_TIMEOUT = 5000;

    constructor(
        private nsp: Namespace,
        private grpcClient: IAnalisadorGrpcClient,
        private eventDispatcher: EventDispatcherInterface
    ) {
        this.setupEvents();
    }

    private setupEvents() {
        this.nsp.on('connection', (socket: Socket) => {


            socket.on('join-session', (sessaoId: string) => {
                console.log(`[IA-Gateway] Socket ${socket.id} entrou na sala de análise: ${sessaoId}`);
                socket.join(sessaoId);
            });

            socket.on('video-frame', async (data: { sessaoId: string, image: Buffer }) => {
                if (this.processingSockets.has(socket.id)) return;

                try {
                    this.processingSockets.add(socket.id);

                    // Race contra o tempo: gRPC vs Timeout
                    const analise = await Promise.race([
                        this.grpcClient.analisarFrame({
                            sessaoId: data.sessaoId,
                            imagem: data.image
                        }),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('TIMEOUT_GRPC')), this.GRPC_TIMEOUT)
                        )
                    ]) as any;

                    // Transmissão para todos na sala
                    this.nsp.to(data.sessaoId).emit('analysis-feedback', analise);


                    this.eventDispatcher.notify(
                        new FrameAnalisadoIA({
                            sessaoId: data.sessaoId,
                            emocaoPredominante: analise.emocao,
                            confianca: analise.confianca,
                            timestamp: Date.now()
                        })
                    );

                } catch (error: any) {
                    if (error.message === 'TIMEOUT_GRPC') {
                        console.warn(`[IA-Gateway] IA demorou demais na sessão ${data.sessaoId}. Frame descartado.`);
                        
                        socket.emit('analysis-error', { message: 'IA Latency High' });
                    } else {
                        console.error(`[IA-Gateway] Erro gRPC na sessão ${data.sessaoId}:`, error);
                    }
                } finally {
                    // Importante: Sempre liberar o socket para o próximo frame, 
                    // independente de erro ou timeout
                    this.processingSockets.delete(socket.id);
                }
            });

            socket.on('disconnect', () => {
                this.processingSockets.delete(socket.id);
            });
        });
    }
}