// tests/unit/application/use-cases/sessao/GerarAcessoSessaoUseCase.spec.ts

import { GerarAcessoSessaoUseCase } from './GerarAcessoSessaoUseCase';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { ITurnCredentialService } from '../../../domain/services/ITurnCredentialService';
import { ISessionRuntimeService } from '../../../domain/services/ISessionRuntimeService';
import { ITokenService } from '../../../domain/services/ITokenService';
import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import AppError from '../../errors/AppError';

describe('GerarAcessoSessaoUseCase', () => {
    let sut: GerarAcessoSessaoUseCase;
    let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
    let mockTurnCredentialService: jest.Mocked<ITurnCredentialService>;
    let mockTurnSessionService: jest.Mocked<ISessionRuntimeService>;
    let mockTokenService: jest.Mocked<ITokenService>;
    let sessaoMock: SessaoEntity;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});

        // Instância limpa para cada teste
        sessaoMock = new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 20 as any, // ID adaptado para tipo numérico
            status: 'agendada' as any,
            data_inicio: new Date(),
        });

        mockSessaoRepo = {
            buscarPorId: jest.fn(),
            salvar: jest.fn(),
            encerrarSessao: jest.fn(),
            buscarAtivas: jest.fn()
        } as any;

        mockTurnCredentialService = {
            generateIceServers: jest.fn()
        } as any;

        mockTurnSessionService = {
            registerCredential: jest.fn(),
            createSession: jest.fn(),
            getSession: jest.fn(),
            invalidateSession: jest.fn(),
            getPresence: jest.fn()
        } as any;

        mockTokenService = {
            gerarSignalingToken: jest.fn(),
            verificarToken: jest.fn(),
            gerarAccessToken: jest.fn(),
            gerarRefreshToken: jest.fn(),
            getRefreshTokenLifespan: jest.fn(),
            getAccessTokenLifespan: jest.fn()
        } as any;

        sut = new GerarAcessoSessaoUseCase(
            mockSessaoRepo,
            mockTurnCredentialService,
            mockTurnSessionService,
            mockTokenService
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve gerar o acesso à sessão com sucesso para o paciente', async () => {
        const iceServersMock = [{ urls: 'turn:turn.exemplo.com:3478', credential: 'pass', username: 'user' }];
        
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
        mockTurnCredentialService.generateIceServers.mockResolvedValue(iceServersMock as any);
        mockTokenService.gerarSignalingToken.mockReturnValue('signaling_token_mocked');
        mockTurnSessionService.registerCredential.mockResolvedValue(undefined as any);

        const resultado = await sut.execute('sessao-uuid-123', 20, 'paciente');

        expect(mockSessaoRepo.buscarPorId).toHaveBeenCalledWith('sessao-uuid-123');
        expect(mockTurnCredentialService.generateIceServers).toHaveBeenCalledWith('sessao-uuid-123', 20);
        expect(mockTokenService.gerarSignalingToken).toHaveBeenCalledWith({
            sessaoId: 'sessao-uuid-123',
            usuarioId: 20,
            tipoUsuario: 'paciente'
        });
        expect(mockTurnSessionService.registerCredential).toHaveBeenCalledWith('sessao-uuid-123', 20);

        expect(resultado).toEqual({
            sessaoId: 'sessao-uuid-123',
            iceServers: iceServersMock,
            tokenSinalizacao: 'signaling_token_mocked'
        });
    });

    it('deve gerar o acesso à sessão com sucesso para o profissional', async () => {
        const iceServersMock = [{ urls: 'turn:turn.exemplo.com:3478' }];
        
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);
        mockTurnCredentialService.generateIceServers.mockResolvedValue(iceServersMock as any);
        mockTokenService.gerarSignalingToken.mockReturnValue('signaling_token_prof_mocked');
        mockTurnSessionService.registerCredential.mockResolvedValue(undefined as any);

        const resultado = await sut.execute('sessao-uuid-123', 10, 'profissional');

        expect(resultado).toEqual({
            sessaoId: 'sessao-uuid-123',
            iceServers: iceServersMock,
            tokenSinalizacao: 'signaling_token_prof_mocked'
        });
    });

    it('deve lançar erro 404 se a sessão não for encontrada', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(null);

        await expect(sut.execute('inexistente', 10, 'profissional'))
            .rejects.toEqual(new AppError("Sessão não encontrada.", 404));

        expect(mockTurnCredentialService.generateIceServers).not.toHaveBeenCalled();
        expect(mockTokenService.gerarSignalingToken).not.toHaveBeenCalled();
    });

    it('deve lançar erro 403 se o usuário não for participante da sessão', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);

        await expect(sut.execute('sessao-uuid-123', 999, 'paciente'))
            .rejects.toEqual(new AppError("Você não tem permissão para acessar esta sessão.", 403));

        expect(mockTurnCredentialService.generateIceServers).not.toHaveBeenCalled();
    });

    it('deve lançar erro 400 se a sessão estiver com status "finalizada"', async () => {
        sessaoMock = new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 20 as any,
            status: 'finalizada' as any,
            data_inicio: new Date(),
           
        });

        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);

        await expect(sut.execute('sessao-uuid-123', 10, 'profissional'))
            .rejects.toEqual(new AppError("Esta sessão já foi encerrada.", 400));

        expect(mockTurnCredentialService.generateIceServers).not.toHaveBeenCalled();
    });

    it('deve lançar erro 400 se a sessão estiver com status "cancelada"', async () => {
        sessaoMock = new SessaoEntity({
            id: 'sessao-uuid-123',
            agendamento_id: 2,
            profissional_id: 10,
            paciente_id: 20 as any,
            status: 'cancelada' as any,
            data_inicio: new Date(),
        });

        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock);

        await expect(sut.execute('sessao-uuid-123', 20, 'paciente'))
            .rejects.toEqual(new AppError("Esta sessão já foi encerrada.", 400));

        expect(mockTurnCredentialService.generateIceServers).not.toHaveBeenCalled();
    });
});