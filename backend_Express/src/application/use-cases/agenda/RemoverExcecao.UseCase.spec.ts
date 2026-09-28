// src/application/use-cases/agenda/RemoverExcecaoUseCase.spec.ts

import { RemoverExcecaoUseCase } from './RemoverExcecaoUseCase';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import AppError from '../../errors/AppError';

describe('RemoverExcecaoUseCase', () => {
    let removerExcecaoUseCase: RemoverExcecaoUseCase;
    let mockBloqueioRepository: jest.Mocked<IBloqueioRepository>;

    beforeEach(() => {
        mockBloqueioRepository = {
            buscarPorId: jest.fn(),
            excluirExcecao: jest.fn(),
        } as any;

        removerExcecaoUseCase = new RemoverExcecaoUseCase(mockBloqueioRepository);
    });

    it('deve remover uma exceção com sucesso', async () => {
        const dados = {
            bloqueioId: 10,
            profissionalId: 1,
            excecaoId: 500
        };

        // Simula que o bloqueio pai existe e pertence ao profissional
        mockBloqueioRepository.buscarPorId.mockResolvedValue({
            id: 10,
            profissionalId: 1
        } as any);

        await removerExcecaoUseCase.execute(dados);

        expect(mockBloqueioRepository.buscarPorId).toHaveBeenCalledWith(10);
        expect(mockBloqueioRepository.excluirExcecao).toHaveBeenCalledWith(500);
    });

    it('deve lançar erro 404 se o bloqueio pai não for encontrado', async () => {
        mockBloqueioRepository.buscarPorId.mockResolvedValue(null);

        const dados = {
            bloqueioId: 999,
            profissionalId: 1,
            excecaoId: 500
        };

        await expect(removerExcecaoUseCase.execute(dados))
            .rejects.toEqual(new AppError("Bloqueio de agenda não encontrado.", 404));

        expect(mockBloqueioRepository.excluirExcecao).not.toHaveBeenCalled();
    });

    it('deve lançar erro 403 se o bloqueio não pertencer ao profissional', async () => {
        mockBloqueioRepository.buscarPorId.mockResolvedValue({
            id: 10,
            profissionalId: 2 // Dono diferente
        } as any);

        const dados = {
            bloqueioId: 10,
            profissionalId: 1, // Quem tenta remover
            excecaoId: 500
        };

        await expect(removerExcecaoUseCase.execute(dados))
            .rejects.toEqual(new AppError("O bloqueio não pertence ao profissional especificado.", 403));

        expect(mockBloqueioRepository.excluirExcecao).not.toHaveBeenCalled();
    });
});