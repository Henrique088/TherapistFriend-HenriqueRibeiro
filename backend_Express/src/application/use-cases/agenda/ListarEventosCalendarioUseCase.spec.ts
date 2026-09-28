// src/application/use-cases/agenda/ListarEventosCalendarioUseCase.spec.ts

import { ListarEventosCalendarioUseCase } from './ListarEventosCalendarioUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';

describe('ListarEventosCalendarioUseCase', () => {
    let listarEventosUseCase: ListarEventosCalendarioUseCase;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let mockBloqueioRepo: jest.Mocked<IBloqueioRepository>;
    let mockDisponibilidadeRepo: jest.Mocked<IDisponibilidadeRepository>;

    // 23/03/2026 é uma Segunda-feira
    const inicioBusca = new Date('2026-03-23T00:00:00Z');
    const fimBusca = new Date('2026-03-23T23:59:59Z');

    beforeEach(() => {
        mockAgendamentoRepo = { buscarPorPeriodo: jest.fn() } as any;
        mockBloqueioRepo = { buscarBloqueiosAtivos: jest.fn() } as any;
        mockDisponibilidadeRepo = { listarGradeCompleta: jest.fn() } as any;

        listarEventosUseCase = new ListarEventosCalendarioUseCase(
            mockAgendamentoRepo,
            mockBloqueioRepo,
            mockDisponibilidadeRepo
        );
    });

    it('deve listar agendamentos, bloqueios e grade de disponibilidade corretamente', async () => {
        // 1. Mock de Agendamento
        mockAgendamentoRepo.buscarPorPeriodo.mockResolvedValue([{
            id: 1,
            pacienteId: 10,
            dataInicio: new Date('2026-03-23T10:00:00Z'),
            dataFim: new Date('2026-03-23T11:00:00Z'),
            tipo: 'consulta',
            status: 'confirmado'
        }] as any);

        // 2. Mock de Bloqueio Pontual
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([{
            id: 2,
            titulo: 'Reunião',
            recorrente: false,
            dataInicio: new Date('2026-03-23T14:00:00Z'),
            dataFim: new Date('2026-03-23T15:00:00Z'),
            estaAtivoParaData: () => true
        }] as any);

        // 3. Mock de Grade (Disponibilidade)
        mockDisponibilidadeRepo.listarGradeCompleta.mockResolvedValue([{
            id: 3,
            diaSemana: 1, // Segunda
            horaInicio: '08:00',
            horaFim: '18:00',
            ativo: true
        }] as any);

        const eventos = await listarEventosUseCase.execute(1, inicioBusca, fimBusca);

        // Verifica se todos os tipos de eventos foram mapeados
        expect(eventos).toEqual(expect.arrayContaining([
            expect.objectContaining({ tipo: 'agendamento', title: 'Consulta' }),
            expect.objectContaining({ tipo: 'bloqueio', title: 'Reunião' }),
            expect.objectContaining({ tipo: 'background', title: 'Expediente' })
        ]));

        // Verifica se a grade de background foi gerada para o dia correto
        const background = eventos.find(e => e.tipo === 'background');
        expect(background?.start.getUTCHours()).toBe(8);
        expect(background?.end.getUTCHours()).toBe(18);
    });

    it('deve projetar bloqueios recorrentes para os dias da semana especificados', async () => {
        mockAgendamentoRepo.buscarPorPeriodo.mockResolvedValue([]);
        mockDisponibilidadeRepo.listarGradeCompleta.mockResolvedValue([]);

        // Bloqueio recorrente às Segundas (1) e Quartas (3)
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([{
            id: 50,
            titulo: 'Almoço',
            recorrente: true,
            diasSemana: [1, 3],
            dataInicio: new Date('2026-01-01T12:00:00Z'), // Criado no passado
            dataFim: new Date('2026-01-01T13:00:00Z'),
            estaAtivoParaData: () => true
        }] as any);

        // Busca cobrindo Segunda a Quarta (23 a 25 de Março)
        const fimTresDias = new Date('2026-03-25T23:59:59Z');
        const eventos = await listarEventosUseCase.execute(1, inicioBusca, fimTresDias);

        const projecoes = eventos.filter(e => e.resource.bloqueioId === 50);

        // Deve haver 2 projeções (Segunda 23 e Quarta 25). Terça 24 não está no diasSemana.
        expect(projecoes).toHaveLength(2);
        expect(projecoes[0].id).toBe('50-2026-03-23');
        expect(projecoes[1].id).toBe('50-2026-03-25');
    });

    it('deve marcar bloqueio como "(Cancelado)" e mudar tipo para "excecao" se houver exceção ativa', async () => {
        mockAgendamentoRepo.buscarPorPeriodo.mockResolvedValue([]);
        mockDisponibilidadeRepo.listarGradeCompleta.mockResolvedValue([]);

        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([{
            id: 2,
            titulo: 'Bloqueio com Exceção',
            recorrente: false,
            dataInicio: new Date('2026-03-23T09:00:00Z'),
            dataFim: new Date('2026-03-23T10:00:00Z'),
            estaAtivoParaData: () => false, // Inativo devido à exceção
            excecoes: [{ id: 99, dataExcecao: '2026-03-23' }]
        }] as any);

        const eventos = await listarEventosUseCase.execute(1, inicioBusca, fimBusca);

        // O correto é:
        expect(eventos[0]).toEqual(
            expect.objectContaining({
                title: '(Cancelado) Bloqueio com Exceção',
                tipo: 'excecao',
                color: '#E5E7EB'
            })
        );
        expect(eventos[0].resource.excecaoId).toBe(99);
    });

    it('deve lançar erro 400 se as datas forem inválidas', async () => {
        await expect(listarEventosUseCase.execute(1, fimBusca, inicioBusca))
            .rejects.toThrow("A data de término não pode ser anterior ao início.");
    });
});