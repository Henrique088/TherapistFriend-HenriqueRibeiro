// src/application/use-cases/agenda/GerarDashboadParaProfissionalUseCase.spec.ts

import { GerarDashboadParaProfissionalUseCase } from './GerarDashboadParaProfissionalUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';

describe('GerarDashboadParaProfissionalUseCase', () => {
    let gerarDashboardUseCase: GerarDashboadParaProfissionalUseCase;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;

    // Fixa uma data específica para os testes: Terça-feira, 17 de Março de 2026
    const dataFixa = new Date('2026-03-17T12:00:00Z');

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(dataFixa);

        mockAgendamentoRepo = {
            countPorPeriodo: jest.fn(),
            distribuicaoMensalProfissional: jest.fn(),
        } as any;

        gerarDashboardUseCase = new GerarDashboadParaProfissionalUseCase(mockAgendamentoRepo);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('deve gerar o dashboard com os totais de hoje, semana, mês e dados do gráfico', async () => {
        const profissionalId = 1;

        // Mock das respostas do repositório
        mockAgendamentoRepo.countPorPeriodo
            .mockResolvedValueOnce(5)   // Mock para "hoje"
            .mockResolvedValueOnce(25)  // Mock para "semana"
            .mockResolvedValueOnce(100); // Mock para "mês"

        const mockGrafico = [
            { mes: 'Janeiro', total: 80 },
            { mes: 'Fevereiro', total: 95 }
        ];
        mockAgendamentoRepo.distribuicaoMensalProfissional.mockResolvedValue(mockGrafico);

        const result = await gerarDashboardUseCase.execute(profissionalId);

        // Verificações do retorno
        expect(result).toEqual({
            resumo: {
                hoje: 5,
                semana: 25,
                mes: 100
            },
            grafico: mockGrafico
        });

        // Verifica se o repositório foi chamado com os períodos corretos (UTC)
        // Hoje (Início e Fim)
        expect(mockAgendamentoRepo.countPorPeriodo).toHaveBeenNthCalledWith(
            1,
            profissionalId,
            expect.any(Date), // hojeInicio
            expect.any(Date)  // hojeFim
        );

        // Verifica se a busca do gráfico pediu os últimos 6 meses
        expect(mockAgendamentoRepo.distribuicaoMensalProfissional).toHaveBeenCalledWith(profissionalId, 6);
    });

    it('deve garantir que as datas de "hoje" cubram o dia inteiro (00:00:00 até 23:59:59)', async () => {
        const profissionalId = 1;
        
        await gerarDashboardUseCase.execute(profissionalId);

        const chamadas = mockAgendamentoRepo.countPorPeriodo.mock.calls;
        const [id, inicio, fim] = chamadas[0]; // Primeira chamada (hoje)

        // Verifica se o fim do dia é exatamente 23:59:59.999 UTC
        expect(fim.getUTCHours()).toBe(23);
        expect(fim.getUTCMinutes()).toBe(59);
        expect(fim.getUTCSeconds()).toBe(59);
        expect(fim.getUTCMilliseconds()).toBe(999);
    });
});