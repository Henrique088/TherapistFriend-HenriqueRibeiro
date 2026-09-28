// src/application/use-cases/admin/GerarDashboardUseCase.spec.ts

import { GerarDashboardUseCase } from './GerarDashboardUseCase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';

describe('GerarDashboardUseCase', () => {
    let gerarDashboardUseCase: GerarDashboardUseCase;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let mockRelatoRepo: jest.Mocked<IRelatoRepository>;

    beforeEach(() => {
        mockUsuarioRepo = {
            countUsuarios: jest.fn(),
            countUsuariosPorTipo: jest.fn(),
        } as any;

        mockAgendamentoRepo = {
            countAgendamentos: jest.fn(),
            countAgendamentosPorMes: jest.fn(),
        } as any;

        mockRelatoRepo = {
            countRelatos: jest.fn(),
        } as any;

        gerarDashboardUseCase = new GerarDashboardUseCase(
            mockUsuarioRepo,
            mockAgendamentoRepo,
            mockRelatoRepo
        );
    });

    it('deve retornar os dados consolidados do dashboard corretamente', async () => {
        // Setup dos mocks com valores fictícios
        mockUsuarioRepo.countUsuarios.mockResolvedValue(100);
        mockUsuarioRepo.countUsuariosPorTipo.mockImplementation(async (tipo) => {
            return tipo === 'paciente' ? 80 : 20;
        });

        mockAgendamentoRepo.countAgendamentos.mockResolvedValue(500);
        mockAgendamentoRepo.countAgendamentosPorMes.mockResolvedValue([
            { mes: 'Janeiro', total: 50 },
            { mes: 'Fevereiro', total: 45 }
        ]);

        mockRelatoRepo.countRelatos.mockResolvedValue(1200);

        const resultado = await gerarDashboardUseCase.execute();

        // Verificações de estrutura e valores
        expect(resultado).toEqual({
            totalUsuarios: 100,
            totalPacientes: 80,
            totalProfissionais: 20,
            totalAgendamentos: 500,
            agendamentosPorMes: [
                { mes: 'Janeiro', total: 50 },
                { mes: 'Fevereiro', total: 45 }
            ],
            totalRelatos: 1200
        });

        // Garante que o repositório de agendamentos foi chamado com o parâmetro de 6 meses
        expect(mockAgendamentoRepo.countAgendamentosPorMes).toHaveBeenCalledWith(6);
        
        // Garante que o count por tipo foi chamado para ambos os papéis
        expect(mockUsuarioRepo.countUsuariosPorTipo).toHaveBeenCalledWith('paciente');
        expect(mockUsuarioRepo.countUsuariosPorTipo).toHaveBeenCalledWith('profissional');
    });

    it('deve lidar com falhas nos repositórios', async () => {
        // Simula uma falha em um dos serviços de contagem
        mockUsuarioRepo.countUsuarios.mockRejectedValue(new Error("Erro de conexão com DB"));

        await expect(gerarDashboardUseCase.execute())
            .rejects.toThrow("Erro de conexão com DB");
    });
});