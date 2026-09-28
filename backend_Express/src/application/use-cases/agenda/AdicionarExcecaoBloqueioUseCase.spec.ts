// src/application/use-cases/agenda/AdicionarExcecaoBloqueioUseCase.spec.ts

import { AdicionarExcecaoBloqueioUseCase } from './AdicionarExcecaoBloqueioUseCase';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import AppError from '../../errors/AppError';

describe('AdicionarExcecaoBloqueioUseCase', () => {
    let adicionarExcecaoBloqueioUseCase: AdicionarExcecaoBloqueioUseCase;
    let mockBloqueioRepository: jest.Mocked<IBloqueioRepository>;

    beforeEach(() => {
        // Criando o mock do repositório
        mockBloqueioRepository = {
            buscarPorId: jest.fn(),
            adicionarExcecao: jest.fn(),
            
        } as any;

        adicionarExcecaoBloqueioUseCase = new AdicionarExcecaoBloqueioUseCase(mockBloqueioRepository);
    });

    it('deve adicionar uma exceção com sucesso ao formatar a data corretamente', async () => {
        const dados = {
            bloqueioId: 1,
            profissionalId: 2,
            dataExcecao: new Date('2026-03-17T00:00:00Z'), // ISO String
            motivo: 'Feriado local'
        };

        // Simula que o bloqueio existe e pertence ao profissional
        mockBloqueioRepository.buscarPorId.mockResolvedValue({
            id: 1,
            profissionalId: 2
        } as any);

        await adicionarExcecaoBloqueioUseCase.execute(dados);

        // Verifica se a busca foi feita com o ID correto
        expect(mockBloqueioRepository.buscarPorId).toHaveBeenCalledWith(1);

        // Verifica se a data foi normalizada para YYYY-MM-DD ignorando fuso local
        expect(mockBloqueioRepository.adicionarExcecao).toHaveBeenCalledWith(
            1,
            '2026-03-17',
            'Feriado local'
        );
    });

    it('deve lançar erro 404 se o bloqueio não for encontrado', async () => {
        mockBloqueioRepository.buscarPorId.mockResolvedValue(null);

        const dados = {
            bloqueioId: 0,
            profissionalId: 2,
            dataExcecao: new Date(),
            motivo: 'Teste'
        };

        await expect(adicionarExcecaoBloqueioUseCase.execute(dados))
            .rejects.toEqual(new AppError("Bloqueio de agenda não encontrado.", 404));
    });

    it('deve lançar erro 403 se o bloqueio não pertencer ao profissional informado', async () => {
        mockBloqueioRepository.buscarPorId.mockResolvedValue({
            id: 5,
            profissionalId: 3
        } as any);

        const dados = {
            bloqueioId: 5,
            profissionalId: 2,
            dataExcecao: new Date('2026-03-17T00:00:00Z'),
            motivo: 'Teste'
        };

        await expect(adicionarExcecaoBloqueioUseCase.execute(dados))
            .rejects.toEqual(new AppError("O bloqueio não pertence ao profissional.", 403));
        
        // Garante que o método de persistência nunca foi chamado
        expect(mockBloqueioRepository.adicionarExcecao).not.toHaveBeenCalled();
    });

    it('deve formatar corretamente a data mesmo em fusos horários diferentes (UTC check)', async () => {
        const dados = {
            bloqueioId: 1,
            profissionalId: 2,
            dataExcecao: new Date('2026-12-31T23:59:59Z'), // Final do ano em UTC
            motivo: 'Virada'
        };

        mockBloqueioRepository.buscarPorId.mockResolvedValue({ profissionalId: 2 } as any);

        await adicionarExcecaoBloqueioUseCase.execute(dados);

        // Deve manter 2026-12-31, independente do fuso do servidor onde o teste roda
        expect(mockBloqueioRepository.adicionarExcecao).toHaveBeenCalledWith(
            expect.any(Number),
            '2026-12-31',
            expect.any(String)
        );
    });
});