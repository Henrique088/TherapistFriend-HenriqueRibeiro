// src/application/use-cases/SalvarGradeDisponibilidadeUseCase.spec.ts

import { SalvarGradeDisponibilidadeUseCase } from './SalvarGradeDisponibilidadeUseCase';
import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { DisponibilidadeEntity } from '../../../domain/entities/DisponibilidadeEntity';

describe('SalvarGradeDisponibilidadeUseCase', () => {
    let sut: SalvarGradeDisponibilidadeUseCase;
    let disponibilidadeRepo: jest.Mocked<IDisponibilidadeRepository>;

    beforeEach(() => {
        disponibilidadeRepo = {
            substituirGrade: jest.fn(),
        } as any;

        sut = new SalvarGradeDisponibilidadeUseCase(disponibilidadeRepo);
        jest.clearAllMocks();
    });

    it('deve transformar DTOs em entidades e salvar a nova grade', async () => {
        // GIVEN
        const profissionalId = 1;
        const gradesDTO = [
            { diaSemana: 1, horaInicio: '08:00', horaFim: '12:00' },
            { diaSemana: 3, horaInicio: '14:00', horaFim: '18:00' }
        ];

        // WHEN
        await sut.execute(profissionalId, gradesDTO);

        // THEN
        expect(disponibilidadeRepo.substituirGrade).toHaveBeenCalledWith(
            profissionalId,
            expect.arrayContaining([
                expect.any(DisponibilidadeEntity),
                expect.any(DisponibilidadeEntity)
            ])
        );

        // Verifica se os dados foram mapeados corretamente para a primeira entidade
        const chamadas = disponibilidadeRepo.substituirGrade.mock.calls[0][1];
        expect(chamadas[0].diaSemana).toBe(1);
        expect(chamadas[0].horaInicio).toBe('08:00');
        expect(chamadas[0].ativo).toBe(true);
    });

    it('deve chamar o repositório com array vazio se nenhum DTO for enviado', async () => {
        // GIVEN
        const profissionalId = 1;
        const gradesDTO: any[] = [];

        // WHEN
        await sut.execute(profissionalId, gradesDTO);

        // THEN
        expect(disponibilidadeRepo.substituirGrade).toHaveBeenCalledWith(
            profissionalId,
            []
        );
    });
});