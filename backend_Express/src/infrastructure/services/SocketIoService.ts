// src/infrastructure/services/SocketIoService.ts

import { Server } from 'socket.io';
import { IConversaRepository } from '../../domain/repositories/IConversaRepository';

export class SocketIoService {

    constructor(
        private io: Server,
        private conversaRepository: IConversaRepository
    ) {
        this.setupHandlers();
    }

    private setupHandlers() {

        this.io.on('connection', (socket: any) => {

            const usuario = socket.usuario; 

            if (usuario?.id) {

                socket.join(`usuario_${usuario.id}`);

                console.log(`🏠 Usuário ${usuario.id} na sala privativa.`);
            }

            // Lógica de Join Conversa Protegido
            socket.on('join_conversa', async (conversaId: number) => {

                const conversa = await this.conversaRepository.buscarPorId(conversaId);

                if (conversa && (conversa.pacienteId === usuario.id || conversa.profissionalId === usuario.id)) {

                    socket.join(`conversa_${conversaId}`);

                    console.log(`✅ Acesso à sala da conversa ${conversaId} autorizado`);

                } else {

                    socket.emit('error_chat', 'Acesso negado');
                }
            });

            socket.on('disconnect', () => {

                console.log(`❌ Desconectado: ${usuario?.id}`);
            });
        });
    }

    // Métodos utilitários que os Use Cases/Listeners vão usar
    enviarMensagem(conversaId: number, mensagem: any) {

        this.io.to(`conversa_${conversaId}`).emit('nova_mensagem', mensagem);
    }

    enviarStatusLeitura(conversaId: number, mensagemIds: number[]) {

        this.io.to(`conversa_${conversaId}`).emit('mensagens_lidas', { mensagemIds });
    }

    enviarMensagemEditada(conversaId: number, mensagemId: number, novoTexto: string) {

        this.io.to(`conversa_${conversaId}`).emit('mensagem_editada', { mensagemId, novoTexto });
    }

    enviarMensagemDeletada(conversaId: number, mensagemId: number) {
        
        this.io.to(`conversa_${conversaId}`).emit('mensagem_deletada', { mensagemId });
    }
}