// src/application/use-cases/relato/RecusarRelatoUseCase.spec.ts

import { RecusarRelatoUseCase } from './RecusarRelatoUseCase';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { RelatoFactory } from '../../../../tests/utils/factories/RelatoFactory';
import AppError from '../../errors/AppError';
import { RecusarRelatosDTO } from '../../dtos/RelatoDTO';

describe('RecusarRelatoUseCase', () => {
    let sut: RecusarRelatoUseCase;
    let mockRelatoRepository: jest.Mocked<IRelatoRepository>;

    // Helper para criar o DTO de entrada
    const makeDto = (overrides?: Partial<RecusarRelatosDTO>): RecusarRelatosDTO => ({
        relatoId: 1,
        profissionalId: 50,
        ...overrides
    });

    beforeEach(() => {
        mockRelatoRepository = {
            buscarPorId: jest.fn(),
            registrarRecusa: jest.fn(),
        } as any;

        sut = new RecusarRelatoUseCase(mockRelatoRepository);
    });

    it('deve permitir que um profissional recuse um relato (adicionar à lista de ocultos)', async () => {
        const dto = makeDto();
        const relatoMock = RelatoFactory.create({ 
            id: dto.relatoId, 
            ids_profissionais_recusados: [] 
        });

        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoMock);

        const result = await sut.execute(dto);

        expect(result.ids_profissionais_recusados).toContain(dto.profissionalId);
        expect(mockRelatoRepository.registrarRecusa).toHaveBeenCalledWith(dto.relatoId, dto.profissionalId);
    });

    it('deve processar desistência se o profissional que recusa era o que estava vinculado', async () => {
        const dto = makeDto({ profissionalId: 50 });
        const relatoMock = RelatoFactory.create({ 
            id: dto.relatoId, 
            status: 'aguardando_aprovacao',
            profissional_id: dto.profissionalId 
        });

        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoMock);

        await sut.execute(dto);

        expect(relatoMock.status).toBe('pendente');
        expect(relatoMock.profissional_id).toBeNull();
        expect(mockRelatoRepository.registrarRecusa).toHaveBeenCalledWith(dto.relatoId, dto.profissionalId);
    });

    it('não deve adicionar o mesmo profissional duas vezes na lista de recusados', async () => {
        const dto = makeDto({ profissionalId: 50 });
        const relatoMock = RelatoFactory.create({ 
            ids_profissionais_recusados: [dto.profissionalId] 
        });

        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoMock);

        const result = await sut.execute(dto);

        const ocorrencias = result.ids_profissionais_recusados.filter(id => id === dto.profissionalId);
        expect(ocorrencias.length).toBe(1);
    });

    it('deve lançar erro 404 se o relato não existir', async () => {
        mockRelatoRepository.buscarPorId.mockResolvedValue(null);

        const promise = sut.execute(makeDto());

        await expect(promise).rejects.toThrow(new AppError('Relato não encontrado', 404));
    });
});