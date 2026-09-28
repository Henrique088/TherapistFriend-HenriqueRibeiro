// tests/unit/application/use-cases/auth/LoginUseCase.spec.ts

import { LoginUseCase } from './LoginUseCase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { ICriptografiaService } from '../../../domain/services/ICriptografiaService';
import { ITokenService } from '../../../domain/services/ITokenService';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import AppError from '../../errors/AppError';

// Mock do uuid para garantir previsibilidade no jti
jest.mock('uuid', () => ({
    v4: () => 'uuid-jti-mocked'
}));

describe('LoginUseCase', () => {
    let sut: LoginUseCase;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;
    let mockCriptografiaService: jest.Mocked<ICriptografiaService>;
    let mockTokenService: jest.Mocked<ITokenService>;
    let mockRefreshTokenRepo: jest.Mocked<IRefreshTokenRepository>;

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

    const loginInputMock = {
        email: 'usuario@exemplo.com',
        senha: 'senha123'
    };

    beforeEach(() => {
        mockUsuarioRepo = {
            buscarPorEmail: jest.fn(),
            salvar: jest.fn(),
            buscarPorId: jest.fn(),
        } as any;

        mockCriptografiaService = {
            comparar: jest.fn(),
            hash: jest.fn()
        } as any;

        mockTokenService = {
            gerarAccessToken: jest.fn(),
            gerarRefreshToken: jest.fn(),
            getAccessTokenLifespan: jest.fn(),
            getRefreshTokenLifespan: jest.fn(),
        } as any;

        mockRefreshTokenRepo = {
            salvarRefreshToken: jest.fn(),
            buscarPorJti: jest.fn(),
            revogarToken: jest.fn()
        } as any;

        sut = new LoginUseCase(
            mockUsuarioRepo,
            mockCriptografiaService,
            mockTokenService,
            mockRefreshTokenRepo
        );
    });

    it('deve realizar login com sucesso e retornar tokens e dados do usuário', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(usuarioValidoMock);
        mockCriptografiaService.comparar.mockResolvedValue(true);
        mockCriptografiaService.hash.mockResolvedValue('hash_refresh_token');

        mockTokenService.gerarAccessToken.mockReturnValue('access_token_mock');
        mockTokenService.gerarRefreshToken.mockReturnValue('refresh_token_mock');
        mockTokenService.getAccessTokenLifespan.mockReturnValue(900000); // 15 min
        mockTokenService.getRefreshTokenLifespan.mockReturnValue(604800000); // 7 dias

        mockRefreshTokenRepo.salvarRefreshToken.mockImplementation(() => Promise.resolve());

        const resultado = await sut.execute(loginInputMock);

        expect(mockUsuarioRepo.buscarPorEmail).toHaveBeenCalledWith(loginInputMock.email);
        expect(mockCriptografiaService.comparar).toHaveBeenCalledWith('senha123', 'hash_senha_valida');

        expect(mockTokenService.gerarAccessToken).toHaveBeenCalledWith({
            id: 1,
            tipo_usuario: 'paciente',
            jti: 'uuid-jti-mocked'
        });

        expect(mockCriptografiaService.hash).toHaveBeenCalledWith('refresh_token_mock');
        expect(mockRefreshTokenRepo.salvarRefreshToken).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: 1,
                token_hash: 'hash_refresh_token',
                jti: 'uuid-jti-mocked'
            })
        );

        expect(resultado).toEqual({
            usuario: usuarioValidoMock.toJSON(),
            accessToken: 'access_token_mock',
            refreshToken: 'refresh_token_mock',
            accessMaxAge: 900000,
            refreshMaxAge: 604800000
        });
    });

    it('deve lançar erro 400 se o e-mail não for encontrado', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(null);

        await expect(sut.execute(loginInputMock))
            .rejects.toEqual(new AppError("Credenciais inválidas", 400));

        expect(mockCriptografiaService.comparar).not.toHaveBeenCalled();
        expect(mockTokenService.gerarAccessToken).not.toHaveBeenCalled();
    });

    it('deve lançar erro 400 se a senha informada for incorreta', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(usuarioValidoMock);
        mockCriptografiaService.comparar.mockResolvedValue(false);

        await expect(sut.execute(loginInputMock))
            .rejects.toEqual(new AppError("Credenciais inválidas", 400));

        expect(mockTokenService.gerarAccessToken).not.toHaveBeenCalled();
        expect(mockRefreshTokenRepo.salvarRefreshToken).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a conta do usuário não estiver ativa (isAtivo)', async () => {
        const usuarioInativoMock = new UsuarioEntity({
            id: 2,
            nome: 'Usuário Inativo',
            email: 'inativo@exemplo.com',
            telefone: '123456789',
            senha_hash: 'hash_valida',
            verificado_email: true,
            verificado_telefone: true,
            tipo_usuario: 'paciente',
            ativo: false
        });

        jest.spyOn(usuarioInativoMock, 'isAtivo').mockImplementation(() => {
            throw new AppError("Conta desativada.", 403);
        });

        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(usuarioInativoMock);
        mockCriptografiaService.comparar.mockResolvedValue(true);

        await expect(sut.execute({ email: 'inativo@exemplo.com', senha: '123' }))
            .rejects.toEqual(new AppError("Conta desativada.", 403));

        expect(mockRefreshTokenRepo.salvarRefreshToken).not.toHaveBeenCalled();
    });
});