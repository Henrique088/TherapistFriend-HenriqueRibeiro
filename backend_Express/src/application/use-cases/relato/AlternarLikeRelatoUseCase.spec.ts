// src/application/use-cases/relato/AlternarLikeRelatoUseCase.spec.ts

import { AlternarLikeRelatoUseCase } from './AlternarLikeRelatoUseCase';
import { ILikeRepository } from '../../../domain/repositories/ILikeRepository';

describe('AlternarLikeRelatoUseCase', () => {
    let sut: AlternarLikeRelatoUseCase;
    let likeRepositoryMock: jest.Mocked<ILikeRepository>;

    beforeEach(() => {
        likeRepositoryMock = {
            verificarSeJaCurtiu: jest.fn(),
            darLike: jest.fn(),
            removerLike: jest.fn(),
            contarLikesDoRelato: jest.fn()
        } as any;

        sut = new AlternarLikeRelatoUseCase(likeRepositoryMock);
    });

    it('deve dar like se o usuário ainda não curtiu o relato', async () => {
        // Arrange: Simula que o usuário NÃO curtiu
        likeRepositoryMock.verificarSeJaCurtiu.mockResolvedValue(false);

        // Act
        const result = await sut.execute(1, 100);

        // Assert
        expect(likeRepositoryMock.darLike).toHaveBeenCalledWith(1, 100);
        expect(result.acao).toBe('curtido');
    });

    it('deve remover o like se o usuário já curtiu o relato', async () => {
        // Arrange: Simula que o usuário JÁ curtiu
        likeRepositoryMock.verificarSeJaCurtiu.mockResolvedValue(true);

        // Act
        const result = await sut.execute(1, 100);

        // Assert
        expect(likeRepositoryMock.removerLike).toHaveBeenCalledWith(1, 100);
        expect(result.acao).toBe('descurtido');
    });
});