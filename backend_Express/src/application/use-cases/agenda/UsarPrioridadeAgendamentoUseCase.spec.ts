// src/application/use-cases/agenda/UsarPrioridadeAgendamentoUseCase.spec.ts

import { UsarPrioridadeAgendamentoUseCase } from './UsarPrioridadeAgendamentoUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import AppError from '../../errors/AppError';

describe('UsarPrioridadeAgendamentoUseCase', () => {
    let usarPrioridadeUseCase: UsarPrioridadeAgendamentoUseCase;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let mockUrgenciaRepo: jest.Mocked<IUrgenciaRepository>;

    const dataInicio = new Date('2026-03-25T10:00:00Z');
    const dataFim = new Date('2026-03-25T11:00:00Z');

    beforeEach(() => {
        mockAgendamentoRepo = { 
            verificarConflito: jest.fn(), 
            criar: jest.fn() 
        } as any;
        mockUrgenciaRepo = { 
            buscarPorId: jest.fn(), 
            atualizar: jest.fn() 
        } as any;

        usarPrioridadeUseCase = new UsarPrioridadeAgendamentoUseCase(
            mockAgendamentoRepo,
            mockUrgenciaRepo
        );
    });

    it('deve criar agendamento e concluir o voucher de prioridade com sucesso', async () => {
        const prioridadeMock = {
            id: 500,
            pacienteId: 10,
            profissionalId: 20,
            status: 'aprovada_aguardando_vaga',
            concluir: jest.fn()
        };

        mockUrgenciaRepo.buscarPorId.mockResolvedValue(prioridadeMock as any);
        mockAgendamentoRepo.verificarConflito.mockResolvedValue(false); // Sem conflitos

        await usarPrioridadeUseCase.execute(10, dataInicio, dataFim, 500);

        // Verifica se o agendamento foi criado como 'confirmado'
        expect(mockAgendamentoRepo.criar).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'confirmado',
                pacienteId: 10,
                profissionalId: 20
            })
        );

        // Verifica se o voucher foi "queimado"
        expect(prioridadeMock.concluir).toHaveBeenCalled();
        expect(mockUrgenciaRepo.atualizar).toHaveBeenCalledWith(prioridadeMock);
    });

    it('deve lançar erro 403 se o voucher pertencer a outro paciente', async () => {
        mockUrgenciaRepo.buscarPorId.mockResolvedValue({
            id: 500,
            pacienteId: 99, // Outro paciente
            status: 'aprovada_aguardando_vaga'
        } as any);

        await expect(usarPrioridadeUseCase.execute(10, dataInicio, dataFim, 500))
            .rejects.toEqual(new AppError("Este voucher de prioridade não pertence a você.", 403));
        
        expect(mockAgendamentoRepo.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro 400 se o voucher já tiver sido utilizado', async () => {
        mockUrgenciaRepo.buscarPorId.mockResolvedValue({
            id: 500,
            pacienteId: 10,
            status: 'concluida' // Já usado
        } as any);

        await expect(usarPrioridadeUseCase.execute(10, dataInicio, dataFim, 500))
            .rejects.toEqual(new AppError("Esta prioridade já foi utilizada ou expirou.", 400));
    });

    it('deve lançar erro 409 se houver conflito de horário no agendamento', async () => {
        mockUrgenciaRepo.buscarPorId.mockResolvedValue({
            id: 500,
            pacienteId: 10,
            profissionalId: 20,
            status: 'aprovada_aguardando_vaga'
        } as any);

        // Simula que alguém agendou no mesmo microssegundo ou o horário está realmente ocupado
        mockAgendamentoRepo.verificarConflito.mockResolvedValue(true);

        await expect(usarPrioridadeUseCase.execute(10, dataInicio, dataFim, 500))
            .rejects.toEqual(new AppError("Horário indisponível.", 409));
        
        expect(mockAgendamentoRepo.criar).not.toHaveBeenCalled();
        expect(mockUrgenciaRepo.atualizar).not.toHaveBeenCalled();
    });
});