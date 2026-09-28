// src/application/use-cases/sessao/ListarRelatoriosUseCase.spec.ts

import { ListarRelatoriosUseCase } from './ListarRelatoriosUseCase';
import { ISessionReportRepository } from '../../../domain/repositories/ISessionReportRepository';

describe('ListarRelatoriosUseCase', () => {
    let useCase: ListarRelatoriosUseCase;
    let mockRepo: jest.Mocked<ISessionReportRepository>;

    beforeEach(() => {
        mockRepo = {
            listarComFiltros: jest.fn(),
        } as any;
        useCase = new ListarRelatoriosUseCase(mockRepo);
    });

    it('deve listar e mapear relatórios com sucesso', async () => {
        const mockData = {
            dados: [
                {
                    id: 'rep-1',
                    session_id: 'sess-1',
                    summary: {
                        emocao_predominante: 'Alegria',
                        confianca_media: 0.85
                    },
                    created_at: new Date('2026-03-25T10:00:00Z'),
                    sessao: {
                        agendamento: {
                            paciente: { codinome: 'Fênix' }
                        }
                    }
                }
            ],
            total: 15
        };

        mockRepo.listarComFiltros.mockResolvedValue(mockData as any);

        const input = {
            profissionalId: 10,
            page: 1,
            limit: 10,
            codinome: 'Fênix'
        };

        const result = await useCase.execute(input);

        // Verifica a chamada ao repositório
        expect(mockRepo.listarComFiltros).toHaveBeenCalledWith(
            10, 1, 10, { codinome: 'Fênix', emocao: undefined, ordem: undefined }
        );

        // Verifica o mapeamento dos dados
        expect(result.relatorios).toHaveLength(1);
        expect(result.relatorios[0].id).toBe('rep-1');
        expect(result.relatorios[0].paciente.codinome).toBe('Fênix');
        expect(result.relatorios[0].resumo.emocaoPredominante).toBe('Alegria');

        // Verifica a lógica de paginação
        expect(result.paginacao.totalPaginas).toBe(2); // 15 itens / 10 por página = 2 páginas
        expect(result.paginacao.totalItems).toBe(15);
    });

    it('deve usar valores padrão para página e limite quando não informados', async () => {
        mockRepo.listarComFiltros.mockResolvedValue({ dados: [], total: 0 } as any);

        await useCase.execute({ profissionalId: 10 });

        expect(mockRepo.listarComFiltros).toHaveBeenCalledWith(
            10, 
            1,  // Default page
            10, // Default limit
            expect.any(Object)
        );
    });

    it('deve retornar "N/A" para codinome se os relacionamentos estiverem ausentes', async () => {
        const mockDataIncompleto = {
            dados: [{
                id: 'rep-1',
                sessao: null // Simula erro de carregamento ou dado órfão
            }],
            total: 1
        };

        mockRepo.listarComFiltros.mockResolvedValue(mockDataIncompleto as any);

        const result = await useCase.execute({ profissionalId: 10 });

        expect(result.relatorios[0].paciente.codinome).toBe("N/A");
    });
});