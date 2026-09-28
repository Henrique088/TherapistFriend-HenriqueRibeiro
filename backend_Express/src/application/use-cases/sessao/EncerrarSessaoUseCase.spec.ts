// tests/unit/application/use-cases/sessao/EncerrarSessaoUseCase.spec.ts

import { EncerrarSessaoUseCase } from './EncerrarSessaoUseCase';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';
import EventDispatcher from '../../../domain/@shared/events/EventDispatcher';
import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import { SessionFinished } from '../../../domain/events/sessao/SessionFinished';
import AppError from '../../errors/AppError';
import { boolean } from 'joi';

describe('EncerrarSessaoUseCase', () => {
    let sut: EncerrarSessaoUseCase;
    let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
    let mockRuntimeService: jest.Mocked<ISessionRuntimeService>;
    let mockEventDispatcher: jest.Mocked<EventDispatcher>;
    let sessaoMock: SessaoEntity;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        sessaoMock = new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 2,
            status: 'em_andamento' as any,
            data_inicio: new Date(),
        });

        // Spy do método interno de validação da própria entidade
        jest.spyOn(sessaoMock, 'verficiarTempoRelatorio').mockImplementation(() => true);

        mockSessaoRepo = {
            buscarPorId: jest.fn(),
            encerrarSessao: jest.fn(),
            salvar: jest.fn(),
            buscarAtivas: jest.fn()
        } as any;

        mockRuntimeService = {
            invalidateSession: jest.fn(),
            createSession: jest.fn(),
            getSession: jest.fn()
        } as any;

        mockEventDispatcher = {
            notify: jest.fn(),
            register: jest.fn(),
            unregister: jest.fn(),
            clearEvents: jest.fn()
        } as any;

        sut = new EncerrarSessaoUseCase(
            mockSessaoRepo,
            mockRuntimeService,
            mockEventDispatcher
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Encerramento Manual (execute)', () => {
        it('deve encerrar a sessão com sucesso quando solicitada pelo profissional responsável', async () => {
            mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
            mockSessaoRepo.encerrarSessao.mockResolvedValue();
            mockRuntimeService.invalidateSession.mockResolvedValue();

            await sut.execute({
                sessaoId: 'sessao-uuid-123',
                usuarioId: 10
            });

            expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
            expect(mockSessaoRepo.encerrarSessao).toHaveBeenCalledWith(sessaoMock);
            expect(mockRuntimeService.invalidateSession).toHaveBeenCalledWith('sessao-uuid-123');
            expect(sessaoMock.verficiarTempoRelatorio).toHaveBeenCalled();
            expect(mockEventDispatcher.notify).toHaveBeenCalledWith(
                expect.any(SessionFinished)
            );
        });

        it('deve lançar erro 404 se a sessão não for encontrada', async () => {
            mockSessaoRepo.buscarPorId.mockResolvedValue(null);

            await expect(sut.execute({ sessaoId: 'inexistente', usuarioId: 10 }))
                .rejects.toEqual(new AppError("Sessão não encontrada.", 404));

            expect(mockSessaoRepo.encerrarSessao).not.toHaveBeenCalled();
            expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
        });

        it('deve lançar erro 403 se o usuário não for o profissional responsável pela sessão', async () => {
            mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);

            await expect(sut.execute({ sessaoId: 'sessao-uuid-123', usuarioId: 999 }))
                .rejects.toEqual(new AppError("Você não possui permissão para encerrar esta sessão.", 403));

            expect(mockSessaoRepo.encerrarSessao).not.toHaveBeenCalled();
            expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
        });
    });

    describe('Encerramento Automático (executeAutomatico)', () => {
        it('deve encerrar a sessão de forma automática com sucesso', async () => {
            mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
            mockSessaoRepo.encerrarSessao.mockResolvedValue();
            mockRuntimeService.invalidateSession.mockResolvedValue();

            await sut.executeAutomatico('sessao-uuid-123');

            expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
            expect(mockSessaoRepo.encerrarSessao).toHaveBeenCalledWith(sessaoMock);
            expect(mockRuntimeService.invalidateSession).toHaveBeenCalledWith('sessao-uuid-123');
            expect(mockEventDispatcher.notify).toHaveBeenCalledWith(expect.any(SessionFinished));
        });

        it('deve retornar sem fazer nada e sem lançar exceção se a sessão não existir', async () => {
            mockSessaoRepo.buscarPorId.mockResolvedValue(null);

            await expect(sut.executeAutomatico('inexistente')).resolves.not.toThrow();

            expect(mockSessaoRepo.encerrarSessao).not.toHaveBeenCalled();
            expect(mockRuntimeService.invalidateSession).not.toHaveBeenCalled();
            expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
        });
    });

    describe('Comportamentos Comuns e Casos de Borda (Idempotência e Tratamento de Erros)', () => {
        it('deve ser idempotente e ignorar o encerramento se a sessão já estiver "finalizada"', async () => {
            sessaoMock = new SessaoEntity({
                id: 'sessao-uuid-123',
                agendamento_id: 3,
                profissional_id: 10,
                paciente_id: 2,
                status: 'finalizada' as any,
                data_inicio: new Date(),
        
            });

            mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);

            await sut.execute({ sessaoId: 'sessao-uuid-123', usuarioId: 10 });

            expect(mockSessaoRepo.encerrarSessao).not.toHaveBeenCalled();
            expect(mockRuntimeService.invalidateSession).not.toHaveBeenCalled();
            expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
        });

        it('deve capturar erro e registrar no console se verficiarTempoRelatorio falhar sem interromper o encerramento da sessão', async () => {
            mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
            mockSessaoRepo.encerrarSessao.mockResolvedValue();
            mockRuntimeService.invalidateSession.mockResolvedValue();

            jest.spyOn(sessaoMock, 'verficiarTempoRelatorio').mockImplementation(() => {
                throw new Error("Erro na verificação de tempo");
            });

            await expect(sut.execute({ sessaoId: 'sessao-uuid-123', usuarioId: 10 })).resolves.not.toThrow();

            expect(mockSessaoRepo.encerrarSessao).toHaveBeenCalled();
            expect(mockRuntimeService.invalidateSession).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalled();
            expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
        });
    });
});