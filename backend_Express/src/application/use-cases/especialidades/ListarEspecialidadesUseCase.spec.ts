// src/application/use-cases/especialidade/ListarEspecialidadesUseCase.spec.ts

import { ListarEspecialidadesUseCase } from './ListarEspecialidadesUseCase';
import { IEspecialidadeRepository } from '../../../domain/repositories/IEspecialidadeRepository';
import { EspecialidadeEntity } from '../../../domain/entities/EspecialidadeEntity';

describe('ListarEspecialidadesUseCase', () => {
    let listarEspecialidadesUseCase: ListarEspecialidadesUseCase;
    let mockEspecialidadeRepo: jest.Mocked<IEspecialidadeRepository>;

    beforeEach(() => {
        mockEspecialidadeRepo = {
            listarTodas: jest.fn(),
        } as any;

        listarEspecialidadesUseCase = new ListarEspecialidadesUseCase(mockEspecialidadeRepo);
    });

    it('deve retornar uma lista de especialidades formatada com id e nome', async () => {
        // Mock das entidades retornadas pelo repositório
        const especialidadesMock = [
            new EspecialidadeEntity({ id: 1, nome: 'Terapia Cognitivo-Comportamental', criadoEm: new Date(), atualizadoEm: new Date() }),
            new EspecialidadeEntity({ id: 2, nome: 'Psicanálise', criadoEm: new Date(), atualizadoEm: new Date() })
        ];

        mockEspecialidadeRepo.listarTodas.mockResolvedValue(especialidadesMock);

        const resultado = await listarEspecialidadesUseCase.execute();

        // Valida se o repositório foi chamado
        expect(mockEspecialidadeRepo.listarTodas).toHaveBeenCalledTimes(1);
        
        // Valida a transformação para o formato simplificado
        expect(resultado).toHaveLength(2);
        expect(resultado[0]).toEqual({ id: 1, nome: 'Terapia Cognitivo-Comportamental' });
        expect(resultado[1]).toEqual({ id: 2, nome: 'Psicanálise' });
    });

    it('deve retornar uma lista vazia se não houver especialidades cadastradas', async () => {
        mockEspecialidadeRepo.listarTodas.mockResolvedValue([]);

        const resultado = await listarEspecialidadesUseCase.execute();

        expect(resultado).toEqual([]);
        expect(resultado).toHaveLength(0);
    });

    it('deve propagar erros caso o repositório falhe', async () => {
        mockEspecialidadeRepo.listarTodas.mockRejectedValue(new Error("Falha ao acessar banco de dados"));

        await expect(listarEspecialidadesUseCase.execute())
            .rejects.toThrow("Falha ao acessar banco de dados");
    });
});