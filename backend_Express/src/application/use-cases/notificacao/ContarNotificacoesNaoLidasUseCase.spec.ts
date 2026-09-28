// src/application/use-cases/notificacao/ContarNotificacoesNaoLidasUseCase.spec.ts

import { ContarNotificacoesNaoLidasUseCase } from './ContarNotificacoesNaoLidasUseCase';

const mockNotificacaoRepo = {
    contarNaoLidas: jest.fn(),
};

describe('ContarNotificacoesNaoLidasUseCase', () => {
    let sut: ContarNotificacoesNaoLidasUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        sut = new ContarNotificacoesNaoLidasUseCase(mockNotificacaoRepo as any);
    });

    it('deve retornar a contagem correta de notificações não lidas', async () => {
        // ARRANGE
        const usuarioId = 10;
        mockNotificacaoRepo.contarNaoLidas.mockResolvedValue(3);

        // ACT
        const resultado = await sut.execute(usuarioId);

        // ASSERT
        expect(resultado).toBe(3);
        expect(mockNotificacaoRepo.contarNaoLidas).toHaveBeenCalledWith(usuarioId);
    });

    it('deve retornar 0 se não houver notificações pendentes', async () => {
        mockNotificacaoRepo.contarNaoLidas.mockResolvedValue(0);
        const resultado = await sut.execute(10);
        expect(resultado).toBe(0);
    });
});