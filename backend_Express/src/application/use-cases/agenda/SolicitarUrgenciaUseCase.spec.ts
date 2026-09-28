// src/application/use-cases/agenda/SolicitarUrgenciaUseCase.spec.ts

import { SolicitarUrgenciaUseCase } from './SolicitarUrgenciaUseCase';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';
import AppError from '../../errors/AppError';

describe('SolicitarUrgenciaUseCase', () => {
    let sut: SolicitarUrgenciaUseCase;
    let urgenciaRepo: jest.Mocked<IUrgenciaRepository>;

    beforeEach(() => {
        urgenciaRepo = {
            buscarAtivaPorPaciente: jest.fn(),
            criar: jest.fn()
        } as any;
        sut = new SolicitarUrgenciaUseCase(urgenciaRepo);
    });

    const dadosValidos = {
        pacienteId: 1,
        profissionalId: 10,
        motivo: 'Crise de ansiedade aguda',
        janelaDeTempo: '3_dias' as const
    };

    it('deve criar uma solicitação de urgência com sucesso', async () => {
        urgenciaRepo.buscarAtivaPorPaciente.mockResolvedValue(null);
        urgenciaRepo.criar.mockImplementation(async (u) => u);

        const resultado = await sut.execute(dadosValidos);

        expect(resultado).toBeInstanceOf(UrgenciaEntity);
        expect(resultado.status).toBe('pendente_aprovacao');
        expect(urgenciaRepo.criar).toHaveBeenCalled();
    });

    it('deve impedir solicitação se já houver uma ativa para o mesmo profissional', async () => {
        urgenciaRepo.buscarAtivaPorPaciente.mockResolvedValue(new UrgenciaEntity({
            ...dadosValidos,
            status: 'pendente_aprovacao'
        }));

        await expect(sut.execute(dadosValidos))
            .rejects.toThrow(new AppError("Você já possui uma solicitação de urgência em análise com este profissional.", 400));
        
        expect(urgenciaRepo.criar).not.toHaveBeenCalled();
    });
});