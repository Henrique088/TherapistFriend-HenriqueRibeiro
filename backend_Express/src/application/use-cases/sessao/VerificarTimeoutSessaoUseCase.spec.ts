// tests/unit/application/use-cases/sessao/VerificarTimeoutSessaoUseCase.spec.ts

import { VerificarTimeoutSessaoUseCase } from './VerificarTimeoutSessaoUseCase';
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';
import EventDispatcher from '../../../domain/@shared/events/EventDispatcher';
import { ParticipantOffline } from '../../../domain/events/sessao/ParticipantOffline';
import { SessionTimeout } from '../../../domain/events/sessao/SessionTimeout';

describe('VerificarTimeoutSessaoUseCase', () => {
    let sut: VerificarTimeoutSessaoUseCase;
    let mockSessionRuntime: jest.Mocked<ISessionRuntimeService>;
    let mockEventDispatcher: jest.Mocked<EventDispatcher>;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});

        mockSessionRuntime = {
            getActiveSessions: jest.fn(),
            getPresence: jest.fn(),
            markOffline: jest.fn(),
            getParticipantPresence: jest.fn(),
            registerPresence: jest.fn(),
            updateHeartbeat: jest.fn(),
            createSession: jest.fn(),
            getSession: jest.fn(),
            invalidateSession: jest.fn(),
            registerCredential: jest.fn(),
            markSessionStarted: jest.fn()
        } as any;

        mockEventDispatcher = {
            notify: jest.fn(),
            register: jest.fn(),
            unregister: jest.fn(),
            clearEvents: jest.fn()
        } as any;

        sut = new VerificarTimeoutSessaoUseCase(
            mockSessionRuntime,
            mockEventDispatcher
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('não deve fazer nada se não houver sessões ativas', async () => {
        mockSessionRuntime.getActiveSessions.mockResolvedValue([]);

        await sut.execute();

        expect(mockSessionRuntime.getActiveSessions).toHaveBeenCalled();
        expect(mockSessionRuntime.getPresence).not.toHaveBeenCalled();
        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });

    it('não deve alterar participantes cujo heartbeat esteja dentro do limite de 30s', async () => {
        const now = Date.now();
        const sessaoId = 'sessao-123';

        mockSessionRuntime.getActiveSessions.mockResolvedValue([sessaoId]);
        mockSessionRuntime.getPresence.mockResolvedValue([
            { usuarioId: 10, online: true, heartbeat: now - 10_000 } as any
        ]);

        await sut.execute();

        expect(mockSessionRuntime.markOffline).not.toHaveBeenCalled();
        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });

    it('deve marcar participante expirado como offline e disparar ParticipantOffline', async () => {
        const now = Date.now();
        const sessaoId = 'sessao-123';

        mockSessionRuntime.getActiveSessions.mockResolvedValue([sessaoId]);

        // Primeira chamada (processamento): participante 10 expirado, participante 20 ativo
        // Segunda chamada (verificação remaining): participante 20 ainda online
        mockSessionRuntime.getPresence
            .mockResolvedValueOnce([
                { usuarioId: 10, online: true, heartbeat: now - 35_000 },
                { usuarioId: 20, online: true, heartbeat: now - 5_000 }
            ] as any)
            .mockResolvedValueOnce([
                { usuarioId: 10, online: false, heartbeat: now - 35_000 },
                { usuarioId: 20, online: true, heartbeat: now - 5_000 }
            ] as any);

        await sut.execute();

        expect(mockSessionRuntime.markOffline).toHaveBeenCalledWith(sessaoId, 10);
        expect(mockEventDispatcher.notify).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.notify).toHaveBeenCalledWith(
            expect.objectContaining({
                eventData: expect.objectContaining({
                    sessaoId,
                    usuarioId: 10
                })
            })
        );
        expect(mockEventDispatcher.notify).not.toHaveBeenCalledWith(expect.any(SessionTimeout));
    });

    it('deve disparar SessionTimeout quando nenhum participante permanecer online na sessão', async () => {
        const now = Date.now();
        const sessaoId = 'sessao-123';

        mockSessionRuntime.getActiveSessions.mockResolvedValue([sessaoId]);

        // Primeira chamada: participante expirado
        // Segunda chamada: todos participantes agora estão offline
        mockSessionRuntime.getPresence
            .mockResolvedValueOnce([
                { usuarioId: 10, online: true, heartbeat: now - 40_000 }
            ] as any)
            .mockResolvedValueOnce([
                { usuarioId: 10, online: false, heartbeat: now - 40_000 }
            ] as any);

        await sut.execute();

        expect(mockSessionRuntime.markOffline).toHaveBeenCalledWith(sessaoId, 10);
        expect(mockEventDispatcher.notify).toHaveBeenCalledTimes(2);

        expect(mockEventDispatcher.notify).toHaveBeenNthCalledWith(
            1,
            expect.any(ParticipantOffline)
        );
        expect(mockEventDispatcher.notify).toHaveBeenNthCalledWith(
            2,
            expect.any(SessionTimeout)
        );
    });

    it('deve ignorar participantes que já estejam offline durante a checagem', async () => {
        const now = Date.now();
        const sessaoId = 'sessao-123';

        mockSessionRuntime.getActiveSessions.mockResolvedValue([sessaoId]);
        mockSessionRuntime.getPresence
            .mockResolvedValueOnce([
                { usuarioId: 10, online: false, heartbeat: now - 50_000 }
            ] as any)
            .mockResolvedValueOnce([
                { usuarioId: 10, online: false, heartbeat: now - 50_000 }
            ] as any);

        await sut.execute();

        expect(mockSessionRuntime.markOffline).not.toHaveBeenCalled();
        expect(mockEventDispatcher.notify).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.notify).toHaveBeenCalledWith(expect.any(SessionTimeout));
    });
});