// tests/unit/application/use-cases/sessao/EntrarSessaoUseCase.spec.ts

import { EntrarSessaoUseCase } from './EntrarSessaoUseCase';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';
import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import AppError from '../../errors/AppError';

describe('EntrarSessaoUseCase', () => {
    let sut: EntrarSessaoUseCase;
    let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
    let mockRuntimeService: jest.Mocked<ISessionRuntimeService>;
    let sessaoMock: SessaoEntity;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});

        sessaoMock = new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 2,
            status: 'agendada' as any,
            data_inicio: new Date(),
        });

        mockSessaoRepo = {
            buscarPorId: jest.fn(),
            salvar: jest.fn(),
            encerrarSessao: jest.fn(),
            buscarAtivas: jest.fn()
        } as any;

        mockRuntimeService = {
            getPresence: jest.fn(),
            createSession: jest.fn(),
            getSession: jest.fn(),
            invalidateSession: jest.fn()
        } as any;

        sut = new EntrarSessaoUseCase(
            mockSessaoRepo,
            mockRuntimeService
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve permitir a entrada na sessão e retornar a quantidade de participantes online', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
        
        // Simula a presença contendo participantes online e offline
        mockRuntimeService.getPresence.mockResolvedValue([
            { userId: 10, online: true } as any,
            { userId: 20, online: true } as any,
            { userId: 30, online: false } as any
        ]);

        const resultado = await sut.execute({
            sessaoId: 'sessao-uuid-123',
            usuarioId: 10
        });

        expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
        expect(mockRuntimeService.getPresence).toHaveBeenCalledWith('sessao-uuid-123');
        expect(resultado).toEqual({ participantesOnline: 2 });
    });

    it('deve retornar 0 participantes online caso nenhum esteja conectado', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
        
        mockRuntimeService.getPresence.mockResolvedValue([
            { userId: 10, online: false } as any,
            { userId: 20, online: false } as any
        ]);

        const resultado = await sut.execute({
            sessaoId: 'sessao-uuid-123',
            usuarioId: 10
        });

        expect(resultado).toEqual({ participantesOnline: 0 });
    });

    it('deve lançar erro 404 se a sessão não for encontrada na base de dados', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(null);

        await expect(sut.execute({ sessaoId: 'sessao-inexistente', usuarioId: 10 }))
            .rejects.toEqual(new AppError("Sessão não encontrada.", 404));

        expect(mockRuntimeService.getPresence).not.toHaveBeenCalled();
    });
});