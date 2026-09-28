// src/application/use-cases/relato/DecidirVinculoUseCase.spec.ts

import { DecidirVinculoUseCase } from './DecidirVinculoUseCase';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { Sequelize } from 'sequelize';
import AppError from '../../errors/AppError';

describe('DecidirVinculoUseCase', () => {
    let useCase: DecidirVinculoUseCase;
    let mockRelatoRepo: jest.Mocked<IRelatoRepository>;
    let mockConversaRepo: jest.Mocked<IConversaRepository>;
    let mockEventDispatcher: jest.Mocked<EventDispatcherInterface>;
    let mockSequelize: jest.Mocked<Sequelize>;
    let mockTransaction: { commit: jest.Mock; rollback: jest.Mock };

   

    beforeEach(() => {

        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn(),
        };
        mockRelatoRepo = {
            buscarPorId: jest.fn(),
            confirmarVinculo: jest.fn(),
            registrarRecusa: jest.fn(),
            buscarDadosParaNotificacao: jest.fn(),
        } as any;

        mockConversaRepo = {
            buscarAtivaEntre: jest.fn(),
            criar: jest.fn(),
        } as any;

        mockEventDispatcher = { notify: jest.fn() } as any;

        // Mock do Sequelize para lidar com transações
        mockSequelize = {
            transaction: jest.fn().mockResolvedValue(mockTransaction),
        } as any;

        useCase = new DecidirVinculoUseCase(
            mockRelatoRepo,
            mockConversaRepo,
            mockSequelize,
            mockEventDispatcher
        );
    });

    it('deve aceitar um vínculo, criar uma conversa e confirmar a transação', async () => {
        const relatoMock = {
            id: 1,
            paciente_id: 10,
            status: 'aguardando_aprovacao',
            profissional_id: 20,
            titulo: 'Meu Relato'
        };

        mockRelatoRepo.buscarPorId.mockResolvedValue(relatoMock as any);
        mockRelatoRepo.buscarDadosParaNotificacao.mockResolvedValue({ paciente_id: 10 } as any);
        mockConversaRepo.buscarAtivaEntre.mockResolvedValue(null);

        const dto = {
            relatoId: 1,
            pacienteId: 10,
            profissionalId: 20,
            decisao: 'aceitar' as const
        };

        const resultado = await useCase.execute(dto);

        // Verificações de Transação e Persistência
        expect(mockSequelize.transaction).toHaveBeenCalled();
        expect(mockRelatoRepo.confirmarVinculo).toHaveBeenCalledWith(1, 20, mockTransaction);
        expect(mockConversaRepo.criar).toHaveBeenCalledWith(expect.anything(), mockTransaction);
        expect(mockTransaction.commit).toHaveBeenCalled();

        // Verificação de Notificação
        expect(mockEventDispatcher.notify).toHaveBeenCalled();
        expect(resultado.id).toBe(1);
    });

    it('deve fazer rollback se a criação da conversa falhar', async () => {
        mockRelatoRepo.buscarPorId.mockResolvedValue({
            id: 1, paciente_id: 10, status: 'aguardando_aprovacao', profissional_id: 20
        } as any);

        mockConversaRepo.buscarAtivaEntre.mockRejectedValue(new Error("Erro de Banco"));

        await expect(useCase.execute({
            relatoId: 1, pacienteId: 10, profissionalId: 20, decisao: 'aceitar'
        })).rejects.toThrow("Erro de Banco");

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('deve lançar erro 403 se o paciente tentar decidir sobre relato de outro', async () => {
        mockRelatoRepo.buscarPorId.mockResolvedValue({
            id: 1, paciente_id: 999, status: 'aguardando_aprovacao'
        } as any);

        await expect(useCase.execute({
            relatoId: 1, pacienteId: 10, profissionalId: 20, decisao: 'aceitar'
        })).rejects.toEqual(new AppError('Não tem permissão para decidir sobre este relato', 403));
    });

    it('deve processar recusa sem abrir transação de conversa', async () => {
        mockRelatoRepo.buscarPorId.mockResolvedValue({
            id: 1, paciente_id: 10, status: 'aguardando_aprovacao', profissional_id: 20
        } as any);

        await useCase.execute({
            relatoId: 1, pacienteId: 10, profissionalId: 20, decisao: 'recusar'
        });

        expect(mockRelatoRepo.registrarRecusa).toHaveBeenCalledWith(1, 20);
        expect(mockSequelize.transaction).not.toHaveBeenCalled();
    });
});