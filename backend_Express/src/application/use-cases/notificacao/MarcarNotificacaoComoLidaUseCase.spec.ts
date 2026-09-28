// src/tests/unit/application/use-cases/notificacao/MarcarNotificacaoComoLidaUseCase.spec.ts

import { MarcarNotificacaoComoLidaUseCase } from './MarcarNotificacaoComoLidaUseCase';
import AppError from '../../errors/AppError';

const mockNotificacaoRepo = {
    marcarComoLida: jest.fn(),
    buscarPorId: jest.fn(),
};

describe('MarcarNotificacaoComoLidaUseCase', () => {
    let sut: MarcarNotificacaoComoLidaUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        sut = new MarcarNotificacaoComoLidaUseCase(mockNotificacaoRepo as any);
    });

    it('deve marcar uma notificação como lida com sucesso', async () => {
    // ARRANGE
    const notificacaoId = 1;
    const usuarioId = 10;

   
    mockNotificacaoRepo.buscarPorId.mockResolvedValue({
        id: notificacaoId,
        usuarioId: usuarioId 
    });

    // ACT
    await sut.execute({notificacaoId, usuarioId});

    // ASSERT
    expect(mockNotificacaoRepo.marcarComoLida).toHaveBeenCalledWith(usuarioId,notificacaoId);
});

    it('deve lançar erro se o usuário tentar marcar como lida uma notificação que não é dele', async () => {
        // Notificação pertence ao usuário 99
        mockNotificacaoRepo.buscarPorId.mockResolvedValue({ id: 1, usuarioId: 99 });

        await expect(sut.execute({notificacaoId: 1, usuarioId: 10})).rejects.toThrow(
            new AppError('Não autorizado', 403)
        );
        
        expect(mockNotificacaoRepo.marcarComoLida).not.toHaveBeenCalled();
    });
});