// src/application/use-cases/AgendarConsultaUseCase.spec.ts

import { AgendarConsultaUseCase } from './AgendarConsultaUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import AppError from '../../errors/AppError';

describe('AgendarConsultaUseCase', () => {
    let sut: AgendarConsultaUseCase;
    let agendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let bloqueioRepo: jest.Mocked<IBloqueioRepository>;
    let disponibilidadeRepo: jest.Mocked<IDisponibilidadeRepository>;
    let pacienteRepo: jest.Mocked<IPacienteRepository>;
    let profissionalRepo: jest.Mocked<IProfissionalRepository>;
    let mockEventDispatcher: any;

    beforeEach(() => {
        agendamentoRepo = { criar: jest.fn(), verificarConflito: jest.fn() } as any;
        bloqueioRepo = { buscarBloqueiosAtivos: jest.fn() } as any;
        disponibilidadeRepo = { buscarPorDiaSemana: jest.fn() } as any;
        pacienteRepo = { buscarPorId: jest.fn() } as any;
        profissionalRepo = { buscarPorUsuarioId: jest.fn() } as any;

        // Criando o mock do Dispatcher
        mockEventDispatcher = {
            notify: jest.fn(),
        };

        sut = new AgendarConsultaUseCase(
            agendamentoRepo,
            bloqueioRepo,
            disponibilidadeRepo,
            pacienteRepo,
            profissionalRepo,
            mockEventDispatcher // Injetando o mock no SUT
        );
        
        jest.clearAllMocks();
    });

    // Helper para criar datas futuras
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(10, 0, 0, 0);

    const amanhaFim = new Date(amanha);
    amanhaFim.setHours(11, 0, 0, 0);

    const dadosDTO = {
        pacienteId: 1,
        profissionalId: 10,
        dataInicio: amanha,
        dataFim: amanhaFim,
        tipo: 'regular' as const,
        observacoes: 'Teste'
    };

    it('deve agendar com sucesso e disparar o Domain Event AgendamentoSolicitado', async () => {
        // Setup de sucesso
        pacienteRepo.buscarPorId.mockResolvedValue({ id: 1, codinome: 'Paciente X' } as any);
        profissionalRepo.buscarPorUsuarioId.mockResolvedValue({ id_usuario: 10 } as any);
        disponibilidadeRepo.buscarPorDiaSemana.mockResolvedValue([
            { horaInicio: '08:00', horaFim: '18:00', ativo: true }
        ] as any);
        bloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([]);
        agendamentoRepo.verificarConflito.mockResolvedValue(false);
        
        const agendamentoCriado = { ...dadosDTO, id: 100 };
        agendamentoRepo.criar.mockResolvedValue(agendamentoCriado as any);

        const result = await sut.execute(dadosDTO);

        // Assert: Persistência
        expect(result.id).toBe(100);
        expect(agendamentoRepo.criar).toHaveBeenCalled();

        // Assert: Evento de Domínio
        expect(mockEventDispatcher.notify).toHaveBeenCalled();
        
        // Pega o evento que foi passado para o notify
        const eventSpied = mockEventDispatcher.notify.mock.calls[0][0];
        
        expect(eventSpied.constructor.name).toBe('AgendamentoSolicitado');
        expect(eventSpied.eventData).toEqual(expect.objectContaining({
            codinome: 'Paciente X',
            profissionalId: 10,
            agendamentoId: 100
        }));
    });

    it('deve lançar erro se a data for no passado e não disparar evento', async () => {
        const dataPassada = new Date();
        dataPassada.setDate(dataPassada.getDate() - 1);

        await expect(sut.execute({ ...dadosDTO, dataInicio: dataPassada }))
            .rejects.toThrow(AppError);

        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });
   
    it('deve lançar erro se o profissional não for encontrado', async () => {
        pacienteRepo.buscarPorId.mockResolvedValue({ id: 1 } as any);
        profissionalRepo.buscarPorUsuarioId.mockResolvedValue(null);

        await expect(sut.execute(dadosDTO))
            .rejects.toThrow(new AppError("Profissional inexistente.", 404));
    });

    it('deve lançar erro se o horário estiver fora da grade de disponibilidade', async () => {
        pacienteRepo.buscarPorId.mockResolvedValue({ id: 1 } as any);
        profissionalRepo.buscarPorUsuarioId.mockResolvedValue({ id_usuario: 10 } as any);
        
        // Mock de grade vazia ou horário que não bate
        disponibilidadeRepo.buscarPorDiaSemana.mockResolvedValue([
            { horaInicio: '14:00', horaFim: '18:00', ativo: true }
        ] as any);

        await expect(sut.execute(dadosDTO))
            .rejects.toThrow(/O profissional não atende neste dia ou horário/);
    });

    it('deve lançar erro se houver um bloqueio ativo no horário', async () => {
        pacienteRepo.buscarPorId.mockResolvedValue({ id: 1 } as any);
        profissionalRepo.buscarPorUsuarioId.mockResolvedValue({ id_usuario: 10 } as any);
        disponibilidadeRepo.buscarPorDiaSemana.mockResolvedValue([
            { horaInicio: '08:00', horaFim: '18:00', ativo: true }
        ] as any);

        const dataInicioBloqueio = new Date(amanha);
        dataInicioBloqueio.setHours(9, 0, 0);

        const dataFimBloqueio = new Date(amanha);
        dataFimBloqueio.setHours(11, 0, 0);

        const bloqueioMock = {
            estaAtivoParaData: () => true,
            dataInicio: dataInicioBloqueio, 
            dataFim: dataFimBloqueio, 
        };
        
        bloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([bloqueioMock] as any);

        await expect(sut.execute(dadosDTO))
            .rejects.toThrow(new AppError("O profissional está indisponível neste horário (Bloqueio de Agenda).", 409));
    });

});