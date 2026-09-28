// src/application/use-cases/mood/RegistrarMoodUseCase.spec.ts

import { RegistrarMoodUseCase } from './RegistrarMoodUseCase';
import { IMoodRegistroRepository } from '../../../domain/repositories/IMoodRegistroRepository';
import { IQueueService } from '../../services/IQueueService';
import AppError from '../../errors/AppError';

describe('RegistrarMoodUseCase', () => {
    let registrarMoodUseCase: RegistrarMoodUseCase;
    let mockMoodRepo: jest.Mocked<IMoodRegistroRepository>;
    let mockQueueService: jest.Mocked<IQueueService>;
    const config = { moodCooldownMinutes: 5 };

    beforeEach(() => {
        mockMoodRepo = {
            buscarDoPeriodo: jest.fn(),
            criar: jest.fn(),
            atualizar: jest.fn(),
        } as any;

        mockQueueService = {
            addJob: jest.fn(),
        } as any;

        registrarMoodUseCase = new RegistrarMoodUseCase(
            mockMoodRepo,
            config,
            mockQueueService
        );

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('deve criar um novo registro de mood quando não houver registro no período', async () => {
        const dto = { usuarioId: 1, mood: 'raiva' as any, intensidade: 4 };
        
        mockMoodRepo.buscarDoPeriodo.mockResolvedValue(null);

        const resultado = await registrarMoodUseCase.execute(dto);

        expect(mockMoodRepo.criar).toHaveBeenCalled();
        expect(mockQueueService.addJob).toHaveBeenCalledWith(
            'ia-analise-geracao',
            'gerar-cards',
            expect.objectContaining({ mood: 'raiva', intensidade: 4 })
        );
        expect(resultado.mood).toBe('raiva');
    });

    it('deve atualizar o mood existente se o cooldown já tiver passado', async () => {
        const dto = { usuarioId: 1, mood: 'ansiedade' as any, intensidade: 3 };
        
        // Simula um registro de 10 minutos atrás (fora do cooldown de 5 min)
        const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);
        const registroExistente = {
            mood: 'tristeza' as any,
            intensidade: 4,
            periodo: 'noite',
            atualizarMood: jest.fn(),
            toJSON: () => ({ atualizado_em: dezMinutosAtras })
        };

        mockMoodRepo.buscarDoPeriodo.mockResolvedValue(registroExistente as any);

        await registrarMoodUseCase.execute(dto);

        expect(registroExistente.atualizarMood).toHaveBeenCalledWith('ansiedade', 3);
        expect(mockMoodRepo.atualizar).toHaveBeenCalledWith(registroExistente);
        expect(mockQueueService.addJob).toHaveBeenCalled();
    });

    it('deve lançar AppError se tentar atualizar dentro da janela de cooldown', async () => {
        const dto = { usuarioId: 1, mood: 'raiva' as any, intensidade: 5 };
        
        // Simula um registro de apenas 1 minuto atrás
        const umMinutoAtras = new Date(Date.now() - 1 * 60 * 1000);
        const registroExistente = {
            toJSON: () => ({ atualizado_em: umMinutoAtras })
        };

        mockMoodRepo.buscarDoPeriodo.mockResolvedValue(registroExistente as any);

        await expect(registrarMoodUseCase.execute(dto))
            .rejects.toEqual(new AppError("Você já registrou seu estado recentemente. Aguarde alguns minutos para atualizar novamente."));
        
        expect(mockMoodRepo.atualizar).not.toHaveBeenCalled();
        expect(mockQueueService.addJob).not.toHaveBeenCalled();
    });

    it('não deve quebrar se o QueueService falhar ao adicionar o job', async () => {
        mockMoodRepo.buscarDoPeriodo.mockResolvedValue(null);
        mockQueueService.addJob.mockRejectedValue(new Error("Redis offline"));

        const dto = { usuarioId: 1, mood: 'neutro' as any, intensidade: 5 };
        
        // Deve concluir a execução mesmo com erro na fila (fail-safe)
        const resultado = await registrarMoodUseCase.execute(dto);

        expect(resultado.mood).toBe('neutro');
        expect(mockMoodRepo.criar).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
    });
});