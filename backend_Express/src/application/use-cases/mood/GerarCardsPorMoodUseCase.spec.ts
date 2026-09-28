// src/application/use-cases/ia/GerarCardsPorMoodUseCase.spec.ts

import { GerarCardsPorMoodUseCase } from './GerarCardsPorMoodUseCase';
import { IMoodRegistroRepository } from '../../../domain/repositories/IMoodRegistroRepository';
import { IQueueService } from '../../services/IQueueService';

describe('GerarCardsPorMoodUseCase', () => {
    let gerarCardsUseCase: GerarCardsPorMoodUseCase;
    let mockMoodRepo: jest.Mocked<IMoodRegistroRepository>;
    let mockQueueService: jest.Mocked<IQueueService>;

    beforeEach(() => {
        mockMoodRepo = {
            buscarUltimoDoDia: jest.fn(),
        } as any;

        mockQueueService = {
            addJob: jest.fn(),
        } as any;

        gerarCardsUseCase = new GerarCardsPorMoodUseCase(mockMoodRepo, mockQueueService);
        
        // Silencia o console.error nos testes para manter o log limpo
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve agendar um job com os dados do mood quando um registro recente for encontrado', async () => {
        const usuarioId = 1;
        const registroMock = {
            mood: 'ansioso',
            intensidade: 8,
            periodo: 'noite'
        };

        mockMoodRepo.buscarUltimoDoDia.mockResolvedValue(registroMock as any);

        await gerarCardsUseCase.execute(usuarioId);

        expect(mockMoodRepo.buscarUltimoDoDia).toHaveBeenCalledWith(usuarioId);
        expect(mockQueueService.addJob).toHaveBeenCalledWith(
            'ia-analise-geracao',
            'gerar-cards',
            { 
                usuarioId, 
                mood: 'ansioso', 
                intensidade: 8, 
                periodo: 'noite' 
            }
        );
    });

    it('deve agendar um job com dados nulos (cards genéricos) quando nenhum registro for encontrado', async () => {
        const usuarioId = 2;
        mockMoodRepo.buscarUltimoDoDia.mockResolvedValue(null);

        await gerarCardsUseCase.execute(usuarioId);

        expect(mockQueueService.addJob).toHaveBeenCalledWith(
            'ia-analise-geracao',
            'gerar-cards',
            { 
                usuarioId, 
                mood: null, 
                intensidade: null, 
                periodo: null 
            }
        );
    });

    it('não deve interromper o fluxo (lançar erro) se o QueueService falhar', async () => {
        mockMoodRepo.buscarUltimoDoDia.mockResolvedValue({ mood: 'feliz' } as any);
        mockQueueService.addJob.mockRejectedValue(new Error("Redis Down"));

        // O execute não deve dar throw, pois você tem um try/catch interno que apenas faz log
        await expect(gerarCardsUseCase.execute(1)).resolves.not.toThrow();
        
        expect(console.error).toHaveBeenCalledWith(
            'Erro ao adicionar job na fila de IA:', 
            expect.any(Error)
        );
    });
});