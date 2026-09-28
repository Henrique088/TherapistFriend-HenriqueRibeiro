// src/infrastructure/events/relato/handlers/EnviarNotificacaoVinculoConfirmadoHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { VinculoRelatoConfirmado } from '../../../../domain/events/relato/VinculoRelatoConfirmado';
import { INotificacaoRepository } from '../../../../domain/repositories/INotificacaoRepository';

export default class EnviarNotificacaoVinculoConfirmadoHandler implements EventHandlerInterface<VinculoRelatoConfirmado> {
    constructor(
        private io: Server,
        private notificacaoRepo: INotificacaoRepository) { }

    async handle(event: VinculoRelatoConfirmado): Promise<void> {
        const { eventData } = event;

        const mensagem = eventData.decisao === 'aceite'
            ? `Sua solicitação com ${eventData.codinomePaciente} foi aceita!`
            : 'Sua solicitação foi recusada.';

        this.io.to(`usuario_${eventData.profissionalId}`).emit('nova_notificacao', {
            relatoId: eventData.relatoId,
            decisao: eventData.decisao,
            mensagem
        });

        if(eventData.decisao === 'aceite') {

            this.notificacaoRepo.criar({
                usuario_id: eventData.pacienteId,
                titulo: 'Nova Conversa Criada',
                mensagem: `Nova conversa criada com o profissional ${eventData.nomeProfissional}`,
                tipo: 'CHAT',
                lida: false,
                metadata: {
                    relatoId: eventData.relatoId,
                    profissionalId: eventData.profissionalId
                }
            });
    
            this.notificacaoRepo.criar({
                usuario_id: eventData.profissionalId,
                titulo: 'Nova Conversa Criada',
                mensagem: `Nova conversa criada com o ${eventData.codinomePaciente}`,
                tipo: 'CHAT',
                lida: false,
                metadata: {
                    relatoId: eventData.relatoId,
                    profissionalId: eventData.profissionalId
                }
            });
        } else{
            this.notificacaoRepo.criar({
                usuario_id: eventData.profissionalId,
                titulo: 'Nova Conversa Criada',
                mensagem: `Solicitação de conversa rejeitada pelo paciente ${eventData.codinomePaciente}`,
                tipo: 'CHAT',
                lida: false,
                metadata: {
                    relatoId: eventData.relatoId,
                    profissionalId: eventData.profissionalId
                }
            });
        }
    }
}