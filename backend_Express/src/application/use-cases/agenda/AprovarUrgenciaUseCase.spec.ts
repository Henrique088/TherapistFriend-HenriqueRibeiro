// src/application/use-cases/agenda/AprovarUrgenciaUseCase.spec.ts

import { AprovarUrgenciaUseCase } from './AprovarUrgenciaUseCase';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';
import AppError from '../../errors/AppError';

describe('AprovarUrgenciaUseCase', () => {
    let sut: AprovarUrgenciaUseCase;
    let urgenciaRepo: jest.Mocked<IUrgenciaRepository>;
    let pacienteRepo: any;
    let profissionalRepo: any; 
    let mockEventDispatcher: any;

    beforeEach(() => {
        urgenciaRepo = {
            buscarPorId: jest.fn(),
            atualizar: jest.fn()
        } as any;

        profissionalRepo = {
            buscarPorUsuarioId: jest.fn()
        };

        pacienteRepo = {
            buscarPorId: jest.fn()
        };

        mockEventDispatcher = {
            notify: jest.fn()
        };

        // Injetando o Dispatcher no Use Case
        sut = new AprovarUrgenciaUseCase(
            urgenciaRepo,
            pacienteRepo,
            profissionalRepo,
            mockEventDispatcher
        );
    });

    const urgenciaMock = new UrgenciaEntity({
        id: 1,
        pacienteId: 100,
        profissionalId: 200,
        motivo: 'Urgente',
        janelaDeTempo: '3_dias',
        status: 'pendente_aprovacao'
    });

    it('deve aprovar uma urgência e disparar o evento UrgenciaConfirmada', async () => {
        // Arrange
        urgenciaRepo.buscarPorId.mockResolvedValue(urgenciaMock);


        pacienteRepo.buscarPorId.mockResolvedValue({
            id: 100,
            idUsuario: 100, 
            codinome: 'Paciente X'
        });

        profissionalRepo.buscarPorUsuarioId.mockResolvedValue({
            nomeCompleto: 'Dr. House'
        });

        // Act
        await sut.execute(1, 200);

        // Assert
        expect(mockEventDispatcher.notify).toHaveBeenCalled();
    });

    it('deve lançar erro e NÃO disparar evento se o profissional não for o dono', async () => {
        urgenciaRepo.buscarPorId.mockResolvedValue(urgenciaMock);

        await expect(sut.execute(1, 999))
            .rejects.toThrow(AppError);

        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a urgência não for encontrada', async () => {
        urgenciaRepo.buscarPorId.mockResolvedValue(null);

        await expect(sut.execute(1, 200))
            .rejects.toThrow(new AppError("Solicitação de urgência não encontrada.", 404));

        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });
});