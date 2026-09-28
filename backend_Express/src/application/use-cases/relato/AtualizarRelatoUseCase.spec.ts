// src/application/use-cases/relato/AtualizarRelatoUseCase.spec.ts

import { AtualizarRelatoUseCase } from './AtualizarRelatoUseCase';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { RelatoFactory } from '../../../../tests/utils/factories/RelatoFactory';
import AppError from '../../errors/AppError';

describe('AtualizarRelatoUseCase', () => {
    let sut: AtualizarRelatoUseCase;
    let mockRelatoRepository: jest.Mocked<IRelatoRepository>;

    beforeEach(() => {
        mockRelatoRepository = {
            buscarPorId: jest.fn(),
            atualizarRelato: jest.fn(),
        } as any;

        sut = new AtualizarRelatoUseCase(mockRelatoRepository);
    });

    const dtoPadrao = {
        relatoId: 1,
        usuarioId: 10,
        novoConteudo: {
            titulo: 'Título Atualizado',
            texto: 'Novo texto do relato',
            categoria: 'ANSIEDADE',
            anonimo: true
        }
    };

    it('deve atualizar um relato com sucesso quando o usuário é o dono', async () => {
        // ARRANGE
        const relatoOriginal = RelatoFactory.create({ 
            id: 1, 
            paciente_id: 10, 
            titulo: 'Título Antigo' 
        });

        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoOriginal);
        
        // Simula o retorno do repositório após o save
        mockRelatoRepository.atualizarRelato.mockImplementation(async (relato) => relato);

        // ACT
        const resultado = await sut.execute(dtoPadrao);

        // ASSERT
        expect(mockRelatoRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(resultado.titulo).toBe('Título Atualizado');
        expect(resultado.texto).toBe('Novo texto do relato');
        expect(mockRelatoRepository.atualizarRelato).toHaveBeenCalled();
    });

    it('deve manter os dados originais se o novoConteudo enviar campos nulos ou indefinidos', async () => {
        // ARRANGE
        const relatoOriginal = RelatoFactory.create({ 
            id: 1, 
            paciente_id: 10, 
            titulo: 'Manter Este Titulo' 
        });
        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoOriginal);
        mockRelatoRepository.atualizarRelato.mockImplementation(async (relato) => relato);

        // ACT: Enviando apenas o título, os outros devem permanecer do original
        const resultado = await sut.execute({
            relatoId: 1,
            usuarioId: 10,
            novoConteudo: { titulo: 'Novo Titulo' }
        });

        // ASSERT
        expect(resultado.titulo).toBe('Novo Titulo');
        expect(resultado.texto).toBe(relatoOriginal.texto); 
    });

    it('deve lançar erro 404 se o relato não for encontrado', async () => {
        // ARRANGE
        mockRelatoRepository.buscarPorId.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(sut.execute(dtoPadrao)).rejects.toThrow(
            new AppError('Relato não encontrado', 404)
        );
        expect(mockRelatoRepository.atualizarRelato).not.toHaveBeenCalled();
    });

    it('deve lançar erro 403 se o usuário não for o dono do relato', async () => {
        // ARRANGE: Relato pertence ao usuário 99, mas o DTO vem com usuário 10
        const relatoDeOutro = RelatoFactory.create({ id: 1, paciente_id: 99 });
        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoDeOutro);

        // ACT & ASSERT
        await expect(sut.execute(dtoPadrao)).rejects.toThrow(
            new AppError('Usuário não autorizado a atualizar este relato', 403)
        );
        expect(mockRelatoRepository.atualizarRelato).not.toHaveBeenCalled();
    });
});