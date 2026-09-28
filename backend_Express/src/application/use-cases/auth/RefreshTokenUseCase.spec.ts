// tests/unit/application/use-cases/auth/RefreshTokenUseCase.spec.ts

import { RefreshTokenUseCase } from './RefreshTokenUseCase';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { ITokenService } from '../../../domain/services/ITokenService';
import { ICriptografiaService } from '../../../domain/services/ICriptografiaService';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import AppError from '../../errors/AppError';

// Mock do uuid para garantir previsibilidade no novo jti
jest.mock('uuid', () => ({
    v4: () => 'novo-jti-uuid-mocked'
}));

describe('RefreshTokenUseCase', () => {
    let sut: RefreshTokenUseCase;
    let mockRefreshTokenRepo: jest.Mocked<IRefreshTokenRepository>;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;
    let mockTokenService: jest.Mocked<ITokenService>;
    let mockCriptografiaService: jest.Mocked<ICriptografiaService>;

    const usuarioValidoMock = new UsuarioEntity({
        id: 1,
        nome: 'Usuário Teste',
        email: 'usuario@exemplo.com',
        telefone: '123456789',
        senha_hash: 'hash_senha_valida',
        verificado_email: true,
        verificado_telefone: true,
        tipo_usuario: 'paciente',
        ativo: true
    });

    const storedRefreshTokenMock = {
        id: 10,
        user_id: 1,
        token_hash: 'hash_do_token_antigo',
        jti: 'jti-antigo-123',
        expires_at: new Date(Date.now() + 600000)
    };

    const payloadMock = {
        id: 1,
        tipo_usuario: 'paciente',
        jti: 'jti-antigo-123'
    };

    beforeEach(() => {
        mockRefreshTokenRepo = {
            buscarRefreshToken: jest.fn(),
            invalidarRefreshToken: jest.fn(),
            salvarRefreshToken: jest.fn(),
            buscarPorJti: jest.fn(),
            revogarToken: jest.fn()
        } as any;

        mockUsuarioRepo = {
            buscarPorId: jest.fn(),
            buscarPorEmail: jest.fn(),
            salvar: jest.fn()
        } as any;

        mockTokenService = {
            verificarToken: jest.fn(),
            gerarAccessToken: jest.fn(),
            gerarRefreshToken: jest.fn(),
            getRefreshTokenLifespan: jest.fn(),
            getAccessTokenLifespan: jest.fn()
        } as any;

        mockCriptografiaService = {
            hash: jest.fn(),
            comparar: jest.fn()
        } as any;

        sut = new RefreshTokenUseCase(
            mockRefreshTokenRepo,
            mockUsuarioRepo,
            mockTokenService,
            mockCriptografiaService
        );
    });

    it('deve realizar a rotação do refresh token com sucesso', async () => {
        mockTokenService.verificarToken.mockReturnValue(payloadMock);
        mockRefreshTokenRepo.buscarRefreshToken.mockResolvedValue(storedRefreshTokenMock);
        mockUsuarioRepo.buscarPorId.mockResolvedValue(usuarioValidoMock);
        mockRefreshTokenRepo.invalidarRefreshToken.mockResolvedValue();

        mockTokenService.gerarAccessToken.mockReturnValue('novo_access_token');
        mockTokenService.gerarRefreshToken.mockReturnValue('novo_refresh_token');
        mockCriptografiaService.hash.mockResolvedValue('novo_hash_refresh_token');

        mockTokenService.getRefreshTokenLifespan.mockReturnValue(604800000); // 7 dias
        mockTokenService.getAccessTokenLifespan.mockReturnValue(900000); // 15 min
        mockRefreshTokenRepo.salvarRefreshToken.mockImplementation(() => Promise.resolve());

        const resultado = await sut.execute('old_refresh_token_string');

        // Validações de fluxo
        expect(mockTokenService.verificarToken).toHaveBeenCalledWith('old_refresh_token_string', 'refresh');
        expect(mockRefreshTokenRepo.buscarRefreshToken).toHaveBeenCalledWith('jti-antigo-123');
        expect(mockUsuarioRepo.buscarPorId).toHaveBeenCalledWith(1);
        expect(mockRefreshTokenRepo.invalidarRefreshToken).toHaveBeenCalledWith('jti-antigo-123');

        // Validação da geração e salvamento do novo token
        expect(mockTokenService.gerarAccessToken).toHaveBeenCalledWith({
            id: 1,
            tipo_usuario: 'paciente',
            jti: 'novo-jti-uuid-mocked'
        });

        expect(mockRefreshTokenRepo.salvarRefreshToken).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: 1,
                token_hash: 'novo_hash_refresh_token',
                jti: 'novo-jti-uuid-mocked'
            })
        );

        // Retorno
        expect(resultado).toEqual({
            accessToken: 'novo_access_token',
            refreshToken: 'novo_refresh_token',
            usuario: usuarioValidoMock.toJSON(),
            refreshMaxAge: 604800000,
            accessMaxAge: 900000
        });
    });

    it('deve lançar erro 401 se nenhum token for enviado', async () => {
        await expect(sut.execute(null))
            .rejects.toEqual(new AppError("Refresh token não enviado", 401));

        await expect(sut.execute(undefined))
            .rejects.toEqual(new AppError("Refresh token não enviado", 401));

        await expect(sut.execute(''))
            .rejects.toEqual(new AppError("Refresh token não enviado", 401));
    });

    it('deve lançar erro 401 se a verificação do token falhar (TokenService)', async () => {
        mockTokenService.verificarToken.mockImplementation(() => {
            throw new Error('Token expirado');
        });

        await expect(sut.execute('token_invalido'))
            .rejects.toEqual(new AppError("Refresh token inválido", 401));
    });

    it('deve lançar erro 401 se o payload retornado for malformatado ou incompleto', async () => {
        mockTokenService.verificarToken.mockReturnValue({ id: 1 } as any); // Sem jti

        await expect(sut.execute('token_sem_jti'))
            .rejects.toEqual(new AppError("Refresh token inválido", 401));
    });

    it('deve lançar erro 401 se o token não for encontrado no banco de dados', async () => {
        mockTokenService.verificarToken.mockReturnValue(payloadMock);
        mockRefreshTokenRepo.buscarRefreshToken.mockResolvedValue(null);

        await expect(sut.execute('token_revogado'))
            .rejects.toEqual(new AppError("Refresh token expirado ou inválido (sessão não encontrada no DB).", 401));

        expect(mockRefreshTokenRepo.invalidarRefreshToken).not.toHaveBeenCalled();
    });

    it('deve lançar erro 401 se o usuário do token não for encontrado', async () => {
        mockTokenService.verificarToken.mockReturnValue(payloadMock);
        mockRefreshTokenRepo.buscarRefreshToken.mockResolvedValue(storedRefreshTokenMock);
        mockUsuarioRepo.buscarPorId.mockResolvedValue(null);

        await expect(sut.execute('token_valido'))
            .rejects.toEqual(new AppError("Sessão inválida. Usuário não encontrado.", 401));

        expect(mockRefreshTokenRepo.invalidarRefreshToken).not.toHaveBeenCalled();
    });

    it('deve lançar erro 403 se a conta do usuário estiver inativa', async () => {
        const usuarioInativoMock = new UsuarioEntity({
            id: 1,
            nome: 'Usuário Inativo',
            email: 'inativo@exemplo.com',
            telefone: '123456789',
            senha_hash: 'hash_senha_valida',
            verificado_email: true,
            verificado_telefone: true,
            tipo_usuario: 'paciente',
            ativo: false
        });

        mockTokenService.verificarToken.mockReturnValue(payloadMock);
        mockRefreshTokenRepo.buscarRefreshToken.mockResolvedValue(storedRefreshTokenMock);
        mockUsuarioRepo.buscarPorId.mockResolvedValue(usuarioInativoMock);

        await expect(sut.execute('token_valido'))
            .rejects.toEqual(new AppError("Sessão revogada. Conta inativa.", 403));

        expect(mockRefreshTokenRepo.invalidarRefreshToken).not.toHaveBeenCalled();
    });
});