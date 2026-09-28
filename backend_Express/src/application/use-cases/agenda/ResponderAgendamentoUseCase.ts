// src/application/use-cases/agenda/ResponderAgendamentoUseCase.ts

import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { AgendamentoRespondido } from '../../../domain/events/agenda/AgendamentoRespondido';
import { IQueueService } from '../../services/IQueueService';
import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import AppError from '../../errors/AppError';
import { ResponderAgendamentoDTO } from '../../dtos/AgendaDTO';

export class ResponderAgendamentoUseCase {
    constructor(private agendamentoRepository: IAgendamentoRepository,
        private pacienteRepository: IPacienteRepository,
        private profissionalRepository: IProfissionalRepository,
        private eventDispatcher: EventDispatcherInterface,
        private queueService: IQueueService,
        private sessaoRepository: ISessaoRepository) { }

    async execute({agendamentoId, acao, profissionalId}: ResponderAgendamentoDTO): Promise<void> {
        const profissional = await this.profissionalRepository.buscarPorUsuario(profissionalId);

        const agendamento = await this.agendamentoRepository.buscarPorId(agendamentoId);

        if (!agendamento) throw new AppError("Agendamento não encontrado.");
        
        if (!profissional) {
            throw new AppError("Não é possível responder sessões de outro profissional");
        }

        // verifica se o profissional da ação pertence ao agendamento
        agendamento.verificaProfissional(profissional?.id!);
        
        agendamento.responder(acao);

        const resposta = await this.agendamentoRepository.atualizar(agendamento);

        const paciente = await this.pacienteRepository.buscarPorId(agendamento.pacienteId);


        console.log("profi: ",profissional)

        if (!paciente) {
            throw new AppError("Paciente errado enviado para a confirmação");
        }

        

        if (resposta && paciente) {
            const agendamentoRespondidoEvent = new AgendamentoRespondido({
                agendamentoId: agendamento.id,
                pacienteId: paciente.idUsuario,
                dataInicio: agendamento.dataInicio,
                dataFinal: agendamento.dataFim,
                nome: profissional?.nome,
                status: agendamento.status
            });
            this.eventDispatcher.notify(agendamentoRespondidoEvent);
        }
        if (acao === 'confirmado') {
            const novaSessao = new SessaoEntity({
                paciente_id: paciente?.idUsuario,
                profissional_id: profissional?.id_usuario,
                agendamento_id: agendamento.id,
                data_inicio: agendamento.dataInicio,
                data_fim: agendamento.dataFim,
                status: 'agendada'
            });

            // Persiste no Banco
            const sessaoPersistida = await this.sessaoRepository.criar(novaSessao);
            try {
                const horarioLembrete = sessaoPersistida.getHorarioLembrete();
                const delay = Math.max(0, horarioLembrete.getTime() - Date.now());
                // Agendando o Job de Lembrete usando IQueueService
                await this.queueService.addJob(
                    'sessao-queue',      // Nome da Fila
                    'lembrete-sessao',   // Nome do Job
                    {
                        agendamentoId: agendamento.id,
                        pacienteId: paciente.idUsuario,
                        profissionalId: profissional.id_usuario,
                        horaInicio: agendamento.dataInicio,
                        link: sessaoPersistida.getLinkSalaEspera(),
                        nomePaciente: paciente?.codinome || 'Paciente',
                        nomeProfissional: profissional?.nome || 'Profissional'
                    },
                    // { delay } // Opções de agendamento do BullMQ
                );

                console.log(`[UseCase] Job de lembrete agendado com delay de ${delay}ms`);
            } catch (error) {
                console.error('Erro ao agendar lembrete de sessão:', error);
            }
        }

    }
}