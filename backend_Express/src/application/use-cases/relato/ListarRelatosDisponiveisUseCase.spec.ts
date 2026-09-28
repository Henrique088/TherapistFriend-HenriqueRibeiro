// src/application/use-cases/relato/ListarRelatosDisponiveisUseCase.spec.ts

import { ListarRelatosDisponiveisUseCase } from './ListarRelatosDisponiveisUseCase';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { RelatoFactory } from '../../../../tests/utils/factories/RelatoFactory';
import { ListarRelatosDTO } from '../../dtos/RelatoDTO';

describe('ListarRelatosDisponiveisUseCase', () => {
    let sut: ListarRelatosDisponiveisUseCase;
    let mockRelatoRepository: jest.Mocked<IRelatoRepository>;

    beforeEach(() => {
        mockRelatoRepository = {
            listarDisponiveis: jest.fn(),
        } as any;

        sut = new ListarRelatosDisponiveisUseCase(mockRelatoRepository);
    });

    it('deve retornar um ListarResponseDTO com relatos formatados e paginação', async () => {
        // GIVEN
        const dto: ListarRelatosDTO = {
            profissionalId: 10,
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
                    resultado_ia: 'leve',
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

        mockRelatoRepository.listarDisponiveis.mockResolvedValue(mockRepoResponse);

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

        // Verifica se o primeiro item tem a estrutura correta de saída
        expect(result.dados[0]).toMatchObject({
            id: 1,
            paciente_id: 2,
            titulo: 'Relato 1',
            categoria: 'Depressao',
            resultado_ia: 'leve',
            data_envio: new Date('2026'),
            quantidadeLikes: 10,
            jaCurtiu: true,
            codinomePaciente: 'Sono'
        });


        expect(mockRelatoRepository.listarDisponiveis).toHaveBeenCalledWith(
            dto.profissionalId,
            dto.page,
            dto.limit,
            expect.any(Object)
        );
    });

    it('deve retornar paginasTotais como 0 quando não houver resultados', async () => {
        mockRelatoRepository.listarDisponiveis.mockResolvedValue({
            dados: [],
            total: 0
        });

        const result = await sut.execute({ profissionalId: 10, page: 1, limit: 5 });

        expect(result.paginasTotais).toBe(0);
        expect(result.dados).toEqual([]);
    });
});