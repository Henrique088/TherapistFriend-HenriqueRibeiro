// src/application/use-cases/auth/LogoutUseCase.spec.ts

import { LogoutUseCase } from './LogoutUseCase';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';

describe('LogoutUseCase', () => {
    let sut: LogoutUseCase;
    let refreshTokenRepositoryMock: jest.Mocked<IRefreshTokenRepository>;
    let tokenServiceMock: any;

    const MOCK_REFRESH_TOKEN = 'jwt.refresh.token.valido';
    const MOCK_JTI = 'a1b2c3d4-jti-unique-id';
    const MOCK_STORED_TOKEN = { 
        jti: MOCK_JTI, 
        user_id: 1 
    };

    beforeEach(() => {
        // Mock do Repositório
        refreshTokenRepositoryMock = {
            buscarRefreshToken: jest.fn(),
            invalidarRefreshToken: jest.fn(),
            salvarRefreshToken: jest.fn(),
        } as any;

        // Mock do TokenService 
        tokenServiceMock = {
            extrairJti: jest.fn().mockReturnValue(MOCK_JTI)
        };

        sut = new LogoutUseCase(refreshTokenRepositoryMock, tokenServiceMock);
        jest.clearAllMocks();
    });

    it('deve revogar o token no DB e encerrar o processo com sucesso', async () => {
        // GIVEN
        refreshTokenRepositoryMock.buscarRefreshToken.mockResolvedValue(MOCK_STORED_TOKEN as any);

        // WHEN
        await sut.execute(MOCK_REFRESH_TOKEN);

        // THEN
        // Primeiro extrai o JTI do token bruto
        expect(tokenServiceMock.extrairJti).toHaveBeenCalledWith(MOCK_REFRESH_TOKEN);
        
        // Depois busca no banco usando o JTI extraído
        expect(refreshTokenRepositoryMock.buscarRefreshToken).toHaveBeenCalledWith(MOCK_JTI);
        
        // Por fim, invalida usando o JTI
        expect(refreshTokenRepositoryMock.invalidarRefreshToken).toHaveBeenCalledWith(MOCK_JTI);
    });

    it('deve retornar silenciosamente se o token não for fornecido', async () => {
        // WHEN
        await sut.execute(undefined);

        // THEN
        expect(tokenServiceMock.extrairJti).not.toHaveBeenCalled();
        expect(refreshTokenRepositoryMock.buscarRefreshToken).not.toHaveBeenCalled();
    });

    it('deve retornar silenciosamente se o token não for encontrado no DB', async () => {
        // GIVEN
        refreshTokenRepositoryMock.buscarRefreshToken.mockResolvedValue(null);

        // WHEN
        await sut.execute(MOCK_REFRESH_TOKEN);

        // THEN
        expect(tokenServiceMock.extrairJti).toHaveBeenCalled();
        expect(refreshTokenRepositoryMock.buscarRefreshToken).toHaveBeenCalledWith(MOCK_JTI);
        
        // Não deve tentar invalidar se não achou nada
        expect(refreshTokenRepositoryMock.invalidarRefreshToken).not.toHaveBeenCalled();
    });
});