// src/application/use-cases/agenda/RemoverBloqueioUseCase.spec.ts

import { RemoverBloqueioUseCase } from './RemoverBloqueioUseCase';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import AppError from '../../errors/AppError';

describe('RemoverBloqueioUseCase', () => {
    let removerBloqueioUseCase: RemoverBloqueioUseCase;
    let mockBloqueioRepository: jest.Mocked<IBloqueioRepository>;

    beforeEach(() => {
        mockBloqueioRepository = {
            buscarPorId: jest.fn(),
            excluir: jest.fn(),
        } as any;

        removerBloqueioUseCase = new RemoverBloqueioUseCase(mockBloqueioRepository);
    });

    it('deve remover um bloqueio com sucesso', async () => {
        const dados = {
            bloqueioId: 100,
            profissionalId: 1
        };

        // Simula que o bloqueio existe e pertence ao profissional 1
        mockBloqueioRepository.buscarPorId.mockResolvedValue({
            id: 100,
            profissionalId: 1
        } as any);

        await removerBloqueioUseCase.execute(dados);

        // Verifica se a exclusão foi chamada com os parâmetros corretos
        expect(mockBloqueioRepository.buscarPorId).toHaveBeenCalledWith(100);
        expect(mockBloqueioRepository.excluir).toHaveBeenCalledWith(1, 100);
    });

    it('deve lançar erro 404 se o bloqueio não for encontrado', async () => {
        mockBloqueioRepository.buscarPorId.mockResolvedValue(null);

        const dados = {
            bloqueioId: 999,
            profissionalId: 1
        };

        await expect(removerBloqueioUseCase.execute(dados))
            .rejects.toEqual(new AppError("Bloqueio de agenda não encontrado.", 404));
        
        expect(mockBloqueioRepository.excluir).not.toHaveBeenCalled();
    });

    it('deve lançar erro 403 se o bloqueio pertencer a outro profissional', async () => {
        // Bloqueio pertence ao profissional 2
        mockBloqueioRepository.buscarPorId.mockResolvedValue({
            id: 100,
            profissionalId: 2
        } as any);

        const dados = {
            bloqueioId: 100,
            profissionalId: 1 // Profissional 1 tentando excluir
        };

        await expect(removerBloqueioUseCase.execute(dados))
            .rejects.toEqual(new AppError("O bloqueio não pertence ao profissional especificado.", 403));
        
        expect(mockBloqueioRepository.excluir).not.toHaveBeenCalled();
    });
});