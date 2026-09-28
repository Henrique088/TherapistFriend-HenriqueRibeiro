// tests/unit/application/use-cases/sessao/RegistrarPresencaSessaoUseCase.spec.ts

import { RegistrarPresencaSessaoUseCase } from './RegistrarPresencaSessaoUseCase';
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';

describe('RegistrarPresencaSessaoUseCase', () => {
    let sut: RegistrarPresencaSessaoUseCase;
    let mockRuntimeService: jest.Mocked<ISessionRuntimeService>;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});

        mockRuntimeService = {
            getParticipantPresence: jest.fn(),
            registerPresence: jest.fn(),
            updateHeartbeat: jest.fn(),
            markOffline: jest.fn(),
            createSession: jest.fn(),
            getSession: jest.fn(),
            invalidateSession: jest.fn(),
            getPresence: jest.fn(),
            registerCredential: jest.fn(),
            markSessionStarted: jest.fn()
        } as any;

        sut = new RegistrarPresencaSessaoUseCase(mockRuntimeService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve registrar a presença do participante quando ele ainda não tiver presença gravada', async () => {
        mockRuntimeService.getParticipantPresence.mockResolvedValue(null);
        mockRuntimeService.registerPresence.mockResolvedValue(undefined as any);

        await sut.execute('sessao-uuid-123', 10);

        expect(mockRuntimeService.getParticipantPresence).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockRuntimeService.registerPresence).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockRuntimeService.updateHeartbeat).not.toHaveBeenCalled();
    });

    it('deve atualizar o heartbeat do participante quando a presença já estiver cadastrada', async () => {
        mockRuntimeService.getParticipantPresence.mockResolvedValue({
            userId: 10,
            online: true
        } as any);
        mockRuntimeService.updateHeartbeat.mockResolvedValue(undefined as any);

        await sut.execute('sessao-uuid-123', 10);

        expect(mockRuntimeService.getParticipantPresence).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockRuntimeService.updateHeartbeat).toHaveBeenCalledWith('sessao-uuid-123', 10);
        expect(mockRuntimeService.registerPresence).not.toHaveBeenCalled();
    });
});