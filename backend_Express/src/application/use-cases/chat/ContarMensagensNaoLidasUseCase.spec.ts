// src/application/use-cases/chat/ContarMensagensNaoLidasUseCase.spec.ts

import { ContarMensagensNaoLidasUseCase } from './ContarMensagensNaoLidasUseCase';
import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';

describe('ContarMensagensNaoLidasUseCase', () => {
    let contarMensagensUseCase: ContarMensagensNaoLidasUseCase;
    let mockMensagemRepository: jest.Mocked<IMensagemRepository>;

    beforeEach(() => {
        mockMensagemRepository = {
            contarTotalNaoLidas: jest.fn(),
            contarNaoLidasAgrupadoPorConversa: jest.fn(),
        } as any;

        contarMensagensUseCase = new ContarMensagensNaoLidasUseCase(mockMensagemRepository);
    });



    it('deve retornar o total global e o dicionário de contagens por conversa', async () => {
        const usuarioId = 123;
        const totalMock = 10;

        // O erro diz que o tipo esperado é { [conversaId: string]: number }
        // Ou seja, um objeto/dicionário, e não um array.
        const agrupadoMock = {
            "1": 7,
            "2": 3
        };

        mockMensagemRepository.contarTotalNaoLidas.mockResolvedValue(totalMock);
        mockMensagemRepository.contarNaoLidasAgrupadoPorConversa.mockResolvedValue(agrupadoMock);

        const resultado = await contarMensagensUseCase.execute({ usuarioId });

        expect(resultado).toEqual({
            total: 10,
            contagensPorConversa: {
                "1": 7,
                "2": 3
            }
        });
    });

    it('deve retornar listas vazias e total zero se não houver mensagens', async () => {
        mockMensagemRepository.contarTotalNaoLidas.mockResolvedValue(0);
        mockMensagemRepository.contarNaoLidasAgrupadoPorConversa.mockResolvedValue({});

        const resultado = await contarMensagensUseCase.execute({ usuarioId: 1 });

        expect(resultado).toEqual({
            total: 0,
            contagensPorConversa: {}
        });
    });

    it('deve falhar se qualquer uma das promises do Promise.all rejeitar', async () => {
        // Se uma falha, o Promise.all falha por inteiro
        mockMensagemRepository.contarTotalNaoLidas.mockResolvedValue(10);
        mockMensagemRepository.contarNaoLidasAgrupadoPorConversa.mockRejectedValue(new Error("DB Connection Timeout"));

        await expect(contarMensagensUseCase.execute({ usuarioId: 1 }))
            .rejects.toThrow("DB Connection Timeout");
    });
});