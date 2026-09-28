// tests/unit/application/use-cases/sessao/IniciarSessaoUseCase.spec.ts

import { IniciarSessaoUseCase } from './IniciarSessaoUseCase';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';
import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import AppError from '../../errors/AppError';

describe('IniciarSessaoUseCase', () => {
    let sut: IniciarSessaoUseCase;
    let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
    let mockRuntimeService: jest.Mocked<ISessionRuntimeService>;
    let sessaoMock: SessaoEntity;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});

        sessaoMock = new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 20 as any,
            status: 'agendada' as any,
            data_inicio: new Date(),
        });

        mockSessaoRepo = {
            buscarPorId: jest.fn(),
            atualizar: jest.fn(),
            salvar: jest.fn(),
            encerrarSessao: jest.fn(),
            buscarAtivas: jest.fn()
        } as any;

        mockRuntimeService = {
            markSessionStarted: jest.fn(),
            createSession: jest.fn(),
            getSession: jest.fn(),
            invalidateSession: jest.fn(),
            getPresence: jest.fn(),
            registerCredential: jest.fn()
        } as any;

        sut = new IniciarSessaoUseCase(
            mockSessaoRepo,
            mockRuntimeService
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve iniciar a sessão com sucesso na primeira chamada', async () => {
        const spyIniciarSessao = jest.spyOn(sessaoMock, 'iniciarSessao');

        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
        mockRuntimeService.markSessionStarted.mockResolvedValue(undefined as any);
        mockSessaoRepo.atualizar.mockResolvedValue(undefined as any);

        await sut.execute('sessao-uuid-123');

        expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
        expect(mockRuntimeService.markSessionStarted).toHaveBeenCalledWith('sessao-uuid-123');
        expect(spyIniciarSessao).toHaveBeenCalled();
        expect(mockSessaoRepo.atualizar).toHaveBeenCalledWith(sessaoMock);
    });

    it('deve ser idempotente e não fazer nada caso a sessão já possua data_inicio_real', async () => {
        const sessaoIniciadaMock = new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 20 as any,
            data_inicio_real: new Date(),
            status: 'em_andamento' as any,
            data_inicio: new Date(),
        });

        const spyIniciarSessao = jest.spyOn(sessaoIniciadaMock, 'iniciarSessao');
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoIniciadaMock);

        await sut.execute('sessao-uuid-123');

        expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
        expect(mockRuntimeService.markSessionStarted).not.toHaveBeenCalled();
        expect(spyIniciarSessao).not.toHaveBeenCalled();
        expect(mockSessaoRepo.atualizar).not.toHaveBeenCalled();
    });

    it('deve lançar erro 404 caso a sessão não seja encontrada', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(null);

        await expect(sut.execute('sessao-inexistente'))
            .rejects.toEqual(new AppError("Sessão não encontrada.", 404));

        expect(mockRuntimeService.markSessionStarted).not.toHaveBeenCalled();
        expect(mockSessaoRepo.atualizar).not.toHaveBeenCalled();
    });
});