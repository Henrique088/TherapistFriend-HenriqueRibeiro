//src/application/use-cases/agenda/AgendarUrgenciaUseCase.spec.ts

import { AgendarUrgenciaUseCase } from './AgendarUrgenciaUseCase';
import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';


describe('AgendarUrgenciaUseCase', () => {
    let sut: AgendarUrgenciaUseCase;
    let agendamentoRepo: any;
    let urgenciaRepo: any;

    beforeEach(() => {
        agendamentoRepo = { criar: jest.fn(a => a) };
        urgenciaRepo = { buscarPorId: jest.fn(), atualizar: jest.fn() };
        sut = new AgendarUrgenciaUseCase(agendamentoRepo, urgenciaRepo);
    });

    it('deve transformar uma urgência aprovada em um agendamento confirmado', async () => {
        // GIVEN
        const urgenciaMock = new UrgenciaEntity({
            id: 50,
            pacienteId: 10,
            profissionalId: 20,
            motivo: 'Dor aguda',
            janelaDeTempo: '3_dias',
            status: 'aprovada_aguardando_vaga',
            aprovadaEm: new Date()
        });

        urgenciaRepo.buscarPorId.mockResolvedValue(urgenciaMock);

        const input = {
            urgenciaId: 50,
            profissionalId: 20,
            dataInicio: new Date('2026-06-01T10:00:00'),
            dataFim: new Date('2026-06-01T11:00:00')
        };

        // WHEN
        const agendamento = await sut.execute(input);

        // THEN
        expect(agendamento.tipo).toBe('urgencia');
        expect(agendamento.pacienteId).toBe(10);
        expect(urgenciaMock.status).toBe('concluida');
        expect(urgenciaRepo.atualizar).toHaveBeenCalledWith(urgenciaMock);
        expect(agendamentoRepo.criar).toHaveBeenCalled();
    });

    it('deve impedir o agendamento se a urgência não estiver aprovada', async () => {
        const urgenciaPendente = new UrgenciaEntity({
            id: 50, pacienteId: 10, profissionalId: 20, motivo: '...', status: 'pendente_aprovacao', janelaDeTempo: '3_dias'
        });
        urgenciaRepo.buscarPorId.mockResolvedValue(urgenciaPendente);

        await expect(sut.execute({ urgenciaId: 50, profissionalId: 20, dataInicio: new Date(), dataFim: new Date() }))
            .rejects.toThrow("Esta urgência não está aprovada para agendamento.");
    });
});