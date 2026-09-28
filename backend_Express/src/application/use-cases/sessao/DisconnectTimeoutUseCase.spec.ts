// tests/unit/application/use-cases/sessao/DisconnectTimeoutUseCase.spec.ts

import { DisconnectTimeoutUseCase } from './DisconnectTimeoutUseCase';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { EncerrarSessaoUseCase } from './EncerrarSessaoUseCase';
import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import AppError from '../../errors/AppError';

describe('DisconnectTimeoutUseCase', () => {
    let sut: DisconnectTimeoutUseCase;
    let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
    let mockEncerrarSessaoUseCase: jest.Mocked<EncerrarSessaoUseCase>;

    const criarSessaoMock = (status: string) => {
        return new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 2,
            status: status as any,
            data_inicio: new Date(),
        });
    };

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});

        mockSessaoRepo = {
            buscarPorId: jest.fn(),
            salvar: jest.fn(),
            buscarAtivas: jest.fn()
        } as any;

        mockEncerrarSessaoUseCase = {
            execute: jest.fn()
        } as any;

        sut = new DisconnectTimeoutUseCase(
            mockSessaoRepo,
            mockEncerrarSessaoUseCase
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve encerrar a sessão utilizando o id do profissional quando a sessão estiver ativa', async () => {
        const sessaoAtivaMock = criarSessaoMock('em_andamento');
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoAtivaMock);
        mockEncerrarSessaoUseCase.execute.mockResolvedValue(undefined as any);

        await sut.execute({ sessaoId: 'sessao-uuid-123' });

        expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
        expect(mockEncerrarSessaoUseCase.execute).toHaveBeenCalledWith({
            sessaoId: 'sessao-uuid-123',
            usuarioId: 10
        });
    });

    it('deve lançar erro 404 se a sessão não for encontrada', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(null);

        await expect(sut.execute({ sessaoId: 'sessao-inexistente' }))
            .rejects.toEqual(new AppError("Sessão não encontrada.", 404));

        expect(mockEncerrarSessaoUseCase.execute).not.toHaveBeenCalled();
    });

    it('não deve encerrar a sessão se o status for "finalizada"', async () => {
        const sessaoFinalizadaMock = criarSessaoMock('finalizada');
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoFinalizadaMock);

        await sut.execute({ sessaoId: 'sessao-uuid-123' });

        expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
        expect(mockEncerrarSessaoUseCase.execute).not.toHaveBeenCalled();
    });

    it('não deve encerrar a sessão se o status for "cancelada"', async () => {
        const sessaoCanceladaMock = criarSessaoMock('cancelada');
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoCanceladaMock);

        await sut.execute({ sessaoId: 'sessao-uuid-123' });

        expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
        expect(mockEncerrarSessaoUseCase.execute).not.toHaveBeenCalled();
    });
});