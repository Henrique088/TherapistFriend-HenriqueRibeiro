// src/application/use-cases/agenda/ListarUrgenciasProfissionalUseCase.spec.ts

import { ListarUrgenciasProfissionalUseCase } from './ListarUrgenciasProfissionalUseCase';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';

describe('ListarUrgenciasProfissionalUseCase', () => {
    let sut: ListarUrgenciasProfissionalUseCase;
    let urgenciaRepo: jest.Mocked<IUrgenciaRepository>;

    beforeEach(() => {
        urgenciaRepo = { listarAtivasPorProfissional: jest.fn() } as any;
        sut = new ListarUrgenciasProfissionalUseCase(urgenciaRepo);
    });

    it('deve separar corretamente urgências pendentes de urgências na fila', async () => {
        // GIVEN
        const u1 = new UrgenciaEntity({ 
            pacienteId: 1, profissionalId: 10, motivo: 'A', status: 'pendente_aprovacao', janelaDeTempo: '3_dias' 
        });
        const u2 = new UrgenciaEntity({ 
            pacienteId: 2, profissionalId: 10, motivo: 'B', status: 'aprovada_aguardando_vaga', janelaDeTempo: '7_dias' 
        });

        urgenciaRepo.listarAtivasPorProfissional.mockResolvedValue([u1, u2]);

        // WHEN
        const resultado = await sut.execute(10);

        // THEN
        expect(resultado.pendentes).toHaveLength(1);
        expect(resultado.naFila).toHaveLength(1);
        expect(resultado.pendentes[0].pacienteId).toBe(1);
        expect(resultado.naFila[0].pacienteId).toBe(2);
    });

    it('deve retornar listas vazias se o profissional não tiver urgências', async () => {
        urgenciaRepo.listarAtivasPorProfissional.mockResolvedValue([]);

        const resultado = await sut.execute(10);

        expect(resultado.pendentes).toEqual([]);
        expect(resultado.naFila).toEqual([]);
    });
});