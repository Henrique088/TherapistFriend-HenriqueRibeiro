// tests/unit/application/use-cases/relato/CriarRelatoUseCase.spec.ts

import { CriarRelatoUseCase } from './CriarRelatoUseCase';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { IQueueService } from '../../services/IQueueService';
import { RelatoFactory } from '../../../../tests/utils/factories/RelatoFactory';
import { CriarRelatoDTO } from '../../dtos/RelatoDTO';

describe('CriarRelatoUseCase', () => {
    let sut: CriarRelatoUseCase;
    let mockRelatoRepository: jest.Mocked<IRelatoRepository>;
    let mockQueueService: jest.Mocked<IQueueService>;

    beforeEach(() => {
        mockRelatoRepository = {
            criar: jest.fn(),
        } as any;

        mockQueueService = {
            addJob: jest.fn(),
        } as any;

        sut = new CriarRelatoUseCase(mockRelatoRepository, mockQueueService);
    });

    const dadosValidos: CriarRelatoDTO = {
        paciente_id: 1,
        titulo: 'Meu desabafo',
        texto: 'Este é um texto longo o suficiente para passar na validação.',
        categoria: 'Ansiedade',
        anonimo: true
    };

    it('deve criar um relato com sucesso e enviar para a fila da IA', async () => {
        const relatoCriado = RelatoFactory.create({ ...dadosValidos, id: 123 });
        mockRelatoRepository.criar.mockResolvedValue(relatoCriado);

        const result = await sut.execute(dadosValidos);

        expect(mockRelatoRepository.criar).toHaveBeenCalled();
        expect(mockQueueService.addJob).toHaveBeenCalledWith('ia-analise-geracao', "analisar-gravidade", {
            relatoId: 123,
            texto: dadosValidos.texto
        });
        expect(result.id).toBe(123);
    });

    it('não deve interromper o fluxo se a fila de IA falhar', async () => {
        const relatoCriado = RelatoFactory.create({ id: 123 });
        mockRelatoRepository.criar.mockResolvedValue(relatoCriado);
        mockQueueService.addJob.mockRejectedValue(new Error('Queue Error'));

        const result = await sut.execute(dadosValidos);

        expect(result.id).toBe(123);
        expect(mockRelatoRepository.criar).toHaveBeenCalled();
    });
});