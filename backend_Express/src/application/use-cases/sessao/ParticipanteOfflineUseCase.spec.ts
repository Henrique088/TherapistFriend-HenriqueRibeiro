// tests/unit/application/use-cases/sessao/ParticipanteOfflineUseCase.spec.ts

import { ParticipanteOfflineUseCase } from './ParticipanteOfflineUseCase';
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';
import EventDispatcher from '../../../domain/@shared/events/EventDispatcher';
import { ParticipantOffline } from '../../../domain/events/sessao/ParticipantOffline';

describe('ParticipanteOfflineUseCase', () => {
    let sut: ParticipanteOfflineUseCase;
    let mockRuntimeService: jest.Mocked<ISessionRuntimeService>;
    let mockEventDispatcher: jest.Mocked<EventDispatcher>;

    beforeEach(() => {
        mockRuntimeService = {
            getParticipantPresence: jest.fn(),
            markOffline: jest.fn(),
            createSession: jest.fn(),
            getSession: jest.fn(),
            invalidateSession: jest.fn(),
            getPresence: jest.fn(),
            registerCredential: jest.fn(),
            markSessionStarted: jest.fn()
        } as any;

        mockEventDispatcher = {
            notify: jest.fn(),
            register: jest.fn(),
            unregister: jest.fn(),
            clearEvents: jest.fn()
        } as any;

        sut = new ParticipanteOfflineUseCase(
            mockRuntimeService,
            mockEventDispatcher
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve marcar o participante como offline e disparar o evento ParticipantOffline', async () => {
        mockRuntimeService.getParticipantPresence.mockResolvedValue({
            userId: 10,
            online: true
        } as any);
        mockRuntimeService.markOffline.mockResolvedValue(undefined as any);

        await sut.execute({ sessaoId: 'sessao-uuid-123', usuarioId: 10 });

        expect(mockRuntimeService.getParticipantPresence).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockRuntimeService.markOffline).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockEventDispatcher.notify).toHaveBeenCalledWith(
            expect.any(ParticipantOffline)
        );
    });

    it('não deve fazer nada caso o participante não seja encontrado', async () => {
        mockRuntimeService.getParticipantPresence.mockResolvedValue(null);

        await sut.execute({ sessaoId: 'sessao-uuid-123', usuarioId: 10 });

        expect(mockRuntimeService.getParticipantPresence).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockRuntimeService.markOffline).not.toHaveBeenCalled();
        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });

    it('não deve fazer nada caso o participante já esteja offline', async () => {
        mockRuntimeService.getParticipantPresence.mockResolvedValue({
            userId: 10,
            online: false
        } as any);

        await sut.execute({ sessaoId: 'sessao-uuid-123', usuarioId: 10 });

        expect(mockRuntimeService.getParticipantPresence).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockRuntimeService.markOffline).not.toHaveBeenCalled();
        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });
});