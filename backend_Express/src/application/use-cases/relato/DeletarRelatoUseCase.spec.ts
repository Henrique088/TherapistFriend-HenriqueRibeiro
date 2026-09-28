// src/application/use-cases/relato/DeletarRelatoUseCase.spec.ts

import { DeletarRelatoUseCase } from './DeletarRelatoUseCase';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { RelatoFactory } from '../../../../tests/utils/factories/RelatoFactory';
import AppError from '../../errors/AppError';

describe('DeletarRelatoUseCase', () => {
    let sut: DeletarRelatoUseCase;
    let mockRelatoRepository: jest.Mocked<IRelatoRepository>;

    beforeEach(() => {
        mockRelatoRepository = {
            buscarPorId: jest.fn(),
            deletarRelato: jest.fn(),
        } as any;

        sut = new DeletarRelatoUseCase(mockRelatoRepository);
    });

    const dtoPadrao = {
        relatoId: 1,
        usuarioId: 10
    };

    it('deve deletar um relato com sucesso quando o usuário é o dono', async () => {
        // ARRANGE
        const relatoExistente = RelatoFactory.create({ 
            id: 1, 
            paciente_id: 10 
        });
        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoExistente);

        // ACT
        await sut.execute(dtoPadrao);

        // ASSERT
        expect(mockRelatoRepository.buscarPorId).toHaveBeenCalledWith(dtoPadrao.relatoId);
        expect(mockRelatoRepository.deletarRelato).toHaveBeenCalledWith(dtoPadrao.usuarioId, dtoPadrao.relatoId);
    });

    it('deve lançar erro 404 se o relato não existir', async () => {
        // ARRANGE
        mockRelatoRepository.buscarPorId.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(sut.execute(dtoPadrao)).rejects.toThrow(
            new AppError('Relato não encontrado.', 404)
        );
        expect(mockRelatoRepository.deletarRelato).not.toHaveBeenCalled();
    });

    it('deve lançar erro 403 se o usuário tentar deletar um relato que não é seu', async () => {
        // ARRANGE: Relato pertence ao usuário 99, mas o DTO pede deleção com usuário 10
        const relatoDeOutro = RelatoFactory.create({ id: 1, paciente_id: 99 });
        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoDeOutro);

        // ACT & ASSERT
        await expect(sut.execute(dtoPadrao)).rejects.toThrow(
            new AppError('Ação não autorizada.', 403)
        );
        expect(mockRelatoRepository.deletarRelato).not.toHaveBeenCalled();
    });
});