// src/application/use-cases/agenda/CancelarAgendamentoPacienteUseCase.spec.ts

import { CancelarAgendamentoPacienteUseCase } from './CancelarAgendamentoPacienteUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';

describe('CancelarAgendamentoPacienteUseCase', () => {
    let cancelarAgendamentoUseCase: CancelarAgendamentoPacienteUseCase;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let mockEventDispatcher: jest.Mocked<EventDispatcherInterface>;

    beforeEach(() => {
        mockAgendamentoRepo = {
            buscarPorId: jest.fn(),
            atualizar: jest.fn(),
        } as any;

        mockEventDispatcher = {
            notify: jest.fn(),
        } as any;

        cancelarAgendamentoUseCase = new CancelarAgendamentoPacienteUseCase(
            mockAgendamentoRepo,
            mockEventDispatcher
        );
    });

    it('deve cancelar um agendamento e disparar o evento com sucesso', async () => {
        // Mock da entidade agendamento
        const mockAgendamento = {
            id: 1,
            pacienteId: 10,
            profissionalId: 20,
            dataInicio: new Date(),
            cancelarPeloPaciente: jest.fn(), // Mock do método da entidade
        };

        mockAgendamentoRepo.buscarPorId.mockResolvedValue(mockAgendamento as any);

        await cancelarAgendamentoUseCase.execute(1);

        // 1. Verifica se chamou a regra de negócio na entidade (24h)
        expect(mockAgendamento.cancelarPeloPaciente).toHaveBeenCalledWith(24);

        // 2. Verifica se o evento de cancelamento foi disparado com os dados corretos
        expect(mockEventDispatcher.notify).toHaveBeenCalledWith(
            expect.objectContaining({
                eventData: expect.objectContaining({
                    agendamentoId: 1,
                    canceladoPor: 'paciente'
                })
            })
        );

        // 3. Verifica se o estado foi persistido no banco
        expect(mockAgendamentoRepo.atualizar).toHaveBeenCalledWith(mockAgendamento);
    });

    it('deve lançar erro se o agendamento não existir', async () => {
        mockAgendamentoRepo.buscarPorId.mockResolvedValue(null);

        await expect(cancelarAgendamentoUseCase.execute(999))
            .rejects.toThrow("Agendamento não encontrado.");
        
        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
        expect(mockAgendamentoRepo.atualizar).not.toHaveBeenCalled();
    });

    it('deve repassar o erro caso a entidade impeça o cancelamento (ex: menos de 24h)', async () => {
        const mockAgendamento = {
            cancelarPeloPaciente: jest.fn().mockImplementation(() => {
                throw new Error("Não é possível cancelar com menos de 24h de antecedência.");
            }),
        };

        mockAgendamentoRepo.buscarPorId.mockResolvedValue(mockAgendamento as any);

        await expect(cancelarAgendamentoUseCase.execute(1))
            .rejects.toThrow("Não é possível cancelar com menos de 24h de antecedência.");

        // Se a entidade falhou, não deve notificar nem salvar
        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
        expect(mockAgendamentoRepo.atualizar).not.toHaveBeenCalled();
    });
});