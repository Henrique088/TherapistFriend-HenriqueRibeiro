// src/application/use-cases/CriarBloqueioUseCase.spec.ts

import { CriarBloqueioUseCase } from './CriarBloqueioUseCase';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { BloqueioEntity } from '../../../domain/entities/BloqueioEntity';
import AppError from '../../errors/AppError';

describe('CriarBloqueioUseCase', () => {
    let sut: CriarBloqueioUseCase;
    let bloqueioRepo: jest.Mocked<IBloqueioRepository>;

    beforeEach(() => {
        bloqueioRepo = {
            salvar: jest.fn(),
        } as any;

        sut = new CriarBloqueioUseCase(bloqueioRepo);
        jest.clearAllMocks();
    });

    const dadosValidos = {
        profissionalId: 10,
        titulo: 'Férias',
        dataInicio: new Date('2026-02-01T08:00:00Z'),
        dataFim: new Date('2026-02-15T18:00:00Z'),
        recorrente: false,
        tipo: undefined,
        diasSemana: []
    };

    it('deve criar um bloqueio com sucesso', async () => {
        // GIVEN
        const bloqueioEsperado = new BloqueioEntity({ ...dadosValidos, ativo: true });
        bloqueioRepo.salvar.mockResolvedValue(bloqueioEsperado);

        // WHEN
        const resultado = await sut.execute(dadosValidos);

        // THEN
        expect(bloqueioRepo.salvar).toHaveBeenCalledWith(expect.any(BloqueioEntity));
        expect(resultado.titulo).toBe('Férias');
        expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro se a data de fim for anterior à data de início', async () => {
        // GIVEN
        const dadosInvalidos = {
            ...dadosValidos,
            dataInicio: new Date('2026-02-10T08:00:00Z'),
            dataFim: new Date('2026-02-01T08:00:00Z'), // Data anterior
        };

        // WHEN & THEN
        await expect(sut.execute(dadosInvalidos))
            .rejects.toThrow(new AppError("A data de término não pode ser anterior ao início.", 400));
        
        expect(bloqueioRepo.salvar).not.toHaveBeenCalled();
    });

    it('deve garantir que o bloqueio seja criado como ativo por padrão', async () => {
        // GIVEN
        bloqueioRepo.salvar.mockImplementation(async (bloqueio) => bloqueio);

        // WHEN
        const resultado = await sut.execute(dadosValidos);

        // THEN
        expect(resultado.ativo).toBe(true);
    });
});