// src/application/use-cases/relato/ListarRelatosPacientes.spec.ts

import { ListarRelatosPacientesUseCase } from './ListarRelatosPacientes';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { RelatoFactory } from '../../../../tests/utils/factories/RelatoFactory';
import { ListarRelatosPacienteDTO } from '../../dtos/RelatoDTO';

describe('ListarRelatosPacientesUseCase', () => {
    let sut: ListarRelatosPacientesUseCase;
    let mockRelatoRepository: jest.Mocked<IRelatoRepository>;

    beforeEach(() => {
        mockRelatoRepository = {
            listarRelatosparaPaciente: jest.fn(),
        } as any;

        sut = new ListarRelatosPacientesUseCase(mockRelatoRepository);
    });

    it('deve retornar um ListarResponseDTO com relatos formatados e paginação', async () => {
        // GIVEN
        const dto: ListarRelatosPacienteDTO = {
            pacienteId: 10,
            page: 1,
            limit: 5
        };

        const mockRepoResponse = {
            dados: [
                RelatoFactory.create({
                    id: 1,
                    paciente_id: 2,
                    titulo: 'Relato 1',
                    categoria: 'Depressao',
                    data_envio: new Date('2026'),
                    quantidadeLikes: 10,
                    jaCurtiu: true,
                    codinomePaciente: 'Sono'
                }),
                RelatoFactory.create({
                    id: 2,
                    titulo: 'Relato 2',
                    quantidadeLikes: 0,
                    jaCurtiu: false
                })
            ],
            total: 15
        };

        mockRelatoRepository.listarRelatosparaPaciente.mockResolvedValue(mockRepoResponse);

        // WHEN
        const result = await sut.execute(dto);

        // THEN
        // Validação da estrutura de paginação (ListarResponseDTO)
        expect(result).toMatchObject({
            total: 15,
            paginasTotais: 3,
            paginaAtual: 1
        });

        // Validação dos dados (Mapeamento da Entidade para DTO)
        expect(result.dados).toHaveLength(2);

        expect(result.dados[0]).toMatchObject({
            id: 1,
            paciente_id: 2,
            titulo: 'Relato 1',
            categoria: 'Depressao',
            data_envio: new Date('2026'),
            quantidadeLikes: 10,
            jaCurtiu: true,
            codinomePaciente: 'Sono'
        });


        expect(mockRelatoRepository.listarRelatosparaPaciente).toHaveBeenCalledWith(
            dto.pacienteId,
            dto.page,
            dto.limit,
            expect.any(Object)
        );
    });

    it('deve retornar paginasTotais como 0 quando não houver resultados', async () => {
        mockRelatoRepository.listarRelatosparaPaciente.mockResolvedValue({
            dados: [],
            total: 0
        });

        const result = await sut.execute({ pacienteId: 10, page: 1, limit: 5 });

        expect(result.paginasTotais).toBe(0);
        expect(result.dados).toEqual([]);
    });
});