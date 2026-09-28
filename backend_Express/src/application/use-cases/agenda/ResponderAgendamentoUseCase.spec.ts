// src/application/use-cases/agenda/ResponderAgendamentoUseCase.spec.ts

import { ResponderAgendamentoUseCase } from './ResponderAgendamentoUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { IQueueService } from '../../services/IQueueService';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';

describe('ResponderAgendamentoUseCase', () => {
    let useCase: ResponderAgendamentoUseCase;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let mockPacienteRepo: jest.Mocked<IPacienteRepository>;
    let mockProfissionalRepo: jest.Mocked<IProfissionalRepository>;
    let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
    let mockQueue: jest.Mocked<IQueueService>;
    let mockDispatcher: jest.Mocked<EventDispatcherInterface>;

    const agendamentoId = 2;
    const profissionalId = 100; // ID do usuário

    beforeEach(() => {
        mockAgendamentoRepo = { buscarPorId: jest.fn(), atualizar: jest.fn() } as any;
        mockPacienteRepo = { buscarPorId: jest.fn() } as any;
        mockProfissionalRepo = { buscarPorUsuario: jest.fn() } as any;
        mockSessaoRepo = { criar: jest.fn() } as any;
        mockQueue = { addJob: jest.fn() } as any;
        mockDispatcher = { notify: jest.fn() } as any;

        useCase = new ResponderAgendamentoUseCase(
            mockAgendamentoRepo,
            mockPacienteRepo,
            mockProfissionalRepo,
            mockDispatcher,
            mockQueue,
            mockSessaoRepo
        );
    });

    it('deve confirmar um agendamento, criar uma sessão e agendar um lembrete', async () => {
        const dataInicio = new Date(Date.now() + 3600000); // 1 hora no futuro
        
        const profissionalMock = { id: 1, id_usuario: profissionalId, nome: 'Dr. Freud' };
        const agendamentoMock = {
            id: agendamentoId,
            pacienteId: 50,
            dataInicio,
            dataFim: new Date(dataInicio.getTime() + 3600000),
            status: 'pendente',
            verificaProfissional: jest.fn(),
            responder: jest.fn().mockImplementation(() => { agendamentoMock.status = 'confirmado'; })
        };
        const pacienteMock = { idUsuario: 50, nome: 'Paciente X' };
        const sessaoMock = { 
            getHorarioLembrete: () => new Date(dataInicio.getTime() - 600000), // 10 min antes
            getLinkSalaEspera: () => 'http://link.com'
        };

        mockProfissionalRepo.buscarPorUsuario.mockResolvedValue(profissionalMock as any);
        mockAgendamentoRepo.buscarPorId.mockResolvedValue(agendamentoMock as any);
        mockAgendamentoRepo.atualizar.mockResolvedValue(agendamentoMock as any);
        mockPacienteRepo.buscarPorId.mockResolvedValue(pacienteMock as any);
        mockSessaoRepo.criar.mockResolvedValue(sessaoMock as any);

        await useCase.execute({
            agendamentoId,
            acao: 'confirmado',
            profissionalId
        });

        // Verificações
        expect(agendamentoMock.responder).toHaveBeenCalledWith('confirmado');
        expect(mockSessaoRepo.criar).toHaveBeenCalled();
        expect(mockDispatcher.notify).toHaveBeenCalled();
        expect(mockQueue.addJob).toHaveBeenCalledWith(
            'sessao-queue',
            'lembrete-sessao',
            expect.objectContaining({
                pacienteId: 50,
                link: 'http://link.com'
            })
        );
    });

    it('deve lançar erro se o agendamento não existir', async () => {
        mockProfissionalRepo.buscarPorUsuario.mockResolvedValue({ id: 1 } as any);
        mockAgendamentoRepo.buscarPorId.mockResolvedValue(null);

        await expect(useCase.execute({ agendamentoId: 4, acao: 'confirmado', profissionalId: 1 }))
            .rejects.toThrow("Agendamento não encontrado.");
    });

    it('deve apenas atualizar o status e notificar em caso de recusa (sem criar sessão)', async () => {
        const agendamentoMock = {
            id: agendamentoId,
            pacienteId: 50,
            verificaProfissional: jest.fn(),
            responder: jest.fn()
        };

        mockProfissionalRepo.buscarPorUsuario.mockResolvedValue({ id: 1 } as any);
        mockAgendamentoRepo.buscarPorId.mockResolvedValue(agendamentoMock as any);
        mockAgendamentoRepo.atualizar.mockResolvedValue(agendamentoMock as any);
        mockPacienteRepo.buscarPorId.mockResolvedValue({ idUsuario: 50 } as any);

        await useCase.execute({ agendamentoId, acao: 'cancelado', profissionalId });

        expect(mockSessaoRepo.criar).not.toHaveBeenCalled();
        expect(mockQueue.addJob).not.toHaveBeenCalled();
        expect(mockDispatcher.notify).toHaveBeenCalled();
    });
});