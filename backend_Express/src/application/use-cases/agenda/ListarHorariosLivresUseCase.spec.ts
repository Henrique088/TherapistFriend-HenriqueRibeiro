// src/application/use-cases/agenda/ListarHorariosLivresUseCase.spec.ts

import { ListarHorariosLivresUseCase } from './ListarHorariosLivresUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';


describe('ListarHorariosLivresUseCase', () => {
    let listarHorariosLivresUseCase: ListarHorariosLivresUseCase;
    let mockDisponibilidadeRepo: jest.Mocked<IDisponibilidadeRepository>;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let mockBloqueioRepo: jest.Mocked<IBloqueioRepository>;
    let mockUrgenciaRepo: jest.Mocked<IUrgenciaRepository>;

    const inicio = new Date('2026-03-23T00:00:00Z'); // Uma Segunda-feira
    const fim = new Date('2026-03-23T23:59:59Z');

    beforeEach(() => {
        mockDisponibilidadeRepo = { buscarPorDiaSemana: jest.fn() } as any;
        mockAgendamentoRepo = { buscarPorPeriodo: jest.fn() } as any;
        mockBloqueioRepo = { buscarBloqueiosAtivos: jest.fn() } as any;
        mockUrgenciaRepo = { buscarAtivaPorPaciente: jest.fn() } as any;

        listarHorariosLivresUseCase = new ListarHorariosLivresUseCase(
            mockDisponibilidadeRepo,
            mockAgendamentoRepo,
            mockBloqueioRepo,
            mockUrgenciaRepo
        );

       
    });

    it('deve retornar um slot como "disponivel" quando não houver conflitos', async () => {
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([]);
        mockAgendamentoRepo.buscarPorPeriodo.mockResolvedValue([]);
        mockUrgenciaRepo.buscarAtivaPorPaciente.mockResolvedValue(null);
        
        // Grade de segunda-feira das 09:00 às 10:00
        mockDisponibilidadeRepo.buscarPorDiaSemana.mockResolvedValue([{
            ativo: true,
            horaInicio: '09:00',
            horaFim: '10:00'
        }] as any);

        const result = await listarHorariosLivresUseCase.execute({
            profissionalId: 1,
            pacienteId: 10,
            inicio,
            fim,
            duracaoMinutos: 60
        });

        expect(result).toContainEqual(expect.objectContaining({
            title: 'Disponível',
            classificacao: 'disponivel',
            tipo: 'agendamento'
        }));
    });

    it('deve identificar uma "Vaga Prioritária" para paciente VIP em bloqueio estratégico', async () => {
        // 1. Paciente tem voucher de urgência aguardando vaga
        mockUrgenciaRepo.buscarAtivaPorPaciente.mockResolvedValue({
            id: 55,
            status: 'aprovada_aguardando_vaga'
        } as any);

        // 2. Existe um bloqueio estratégico no horário
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([{
            tipo: 'estrategico',
            recorrente: false,
            dataInicio: new Date('2026-03-23T09:00:00Z'),
            dataFim: new Date('2026-03-23T10:00:00Z'),
            ativo: true,
            estaAtivoParaData: () => true
        }] as any);

        mockAgendamentoRepo.buscarPorPeriodo.mockResolvedValue([]);
        mockDisponibilidadeRepo.buscarPorDiaSemana.mockResolvedValue([{
            ativo: true, horaInicio: '09:00', horaFim: '10:00'
        }] as any);

        const result = await listarHorariosLivresUseCase.execute({
            profissionalId: 1,
            pacienteId: 10,
            inicio,
            fim,
            duracaoMinutos: 60
        });

        expect(result).toContainEqual(expect.objectContaining({
            title: 'Vaga Prioritária',
            classificacao: 'vaga_vip',
            resource: { urgenciaId: 55 }
        }));
    });

    it('deve marcar slot como "Ocupado" se houver agendamento de outro paciente', async () => {
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([]);
        mockUrgenciaRepo.buscarAtivaPorPaciente.mockResolvedValue(null);
        
        // Agendamento existente para OUTRO paciente (ID 99)
        mockAgendamentoRepo.buscarPorPeriodo.mockResolvedValue([{
            id: 100,
            pacienteId: 99,
            dataInicio: new Date('2026-03-23T09:00:00Z'),
            dataFim: new Date('2026-03-23T10:00:00Z'),
            status: 'confirmado'
        }] as any);

        mockDisponibilidadeRepo.buscarPorDiaSemana.mockResolvedValue([{
            ativo: true, horaInicio: '09:00', horaFim: '10:00'
        }] as any);

        const result = await listarHorariosLivresUseCase.execute({
            profissionalId: 1,
            pacienteId: 10, // Paciente atual
            inicio,
            fim,
            duracaoMinutos: 60
        });

        expect(result).toContainEqual(expect.objectContaining({
            title: 'Ocupado',
            classificacao: 'ocupado'
        }));
    });

    it('deve lançar erro se a data fim for menor que a data início', async () => {
        await expect(listarHorariosLivresUseCase.execute({
            profissionalId: 1,
            pacienteId: 10,
            inicio: new Date('2026-03-23'),
            fim: new Date('2026-03-22'),
            duracaoMinutos: 60
        })).rejects.toThrow("A data de término não pode ser anterior ao início.");
    });
});