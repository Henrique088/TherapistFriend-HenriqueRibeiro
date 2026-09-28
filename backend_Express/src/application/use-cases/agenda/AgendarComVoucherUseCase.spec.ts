// src/application/use-cases/agenda/AgendarComVoucherUseCase.spec.ts

import { AgendarComVoucherUseCase } from './AgendarComVoucherUseCase';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IVoucherRepository } from '../../../domain/repositories/IVoucherRepository';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { AgendamentoEntity } from '../../../domain/entities/AgendamentoEntity';
import AppError from '../../errors/AppError';

describe('AgendarComVoucherUseCase', () => {
    let agendarComVoucherUseCase: AgendarComVoucherUseCase;
    let mockAgendamentoRepo: jest.Mocked<IAgendamentoRepository>;
    let mockVoucherRepo: jest.Mocked<IVoucherRepository>;
    let mockBloqueioRepo: jest.Mocked<IBloqueioRepository>;

    const dataTeste = new Date('2026-03-20T10:00:00Z');
    const dataFimTeste = new Date('2026-03-20T11:00:00Z');

    beforeEach(() => {
        mockAgendamentoRepo = { verificarConflito: jest.fn(), criar: jest.fn() } as any;
        mockVoucherRepo = { buscarPorId: jest.fn(), atualizar: jest.fn() } as any;
        mockBloqueioRepo = { buscarBloqueiosAtivos: jest.fn() } as any;

        agendarComVoucherUseCase = new AgendarComVoucherUseCase(
            mockAgendamentoRepo,
            mockVoucherRepo,
            mockBloqueioRepo
        );
    });

    it('deve criar um agendamento com sucesso quando o voucher é válido e o horário está livre', async () => {
        const mockVoucher = {
            id: 1,
            pacienteId: 10,
            profissionalId: 20,
            estaValido: () => true,
            marcarComoUsado: jest.fn(),
        };

        mockVoucherRepo.buscarPorId.mockResolvedValue(mockVoucher as any);
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([]);
        mockAgendamentoRepo.verificarConflito.mockResolvedValue(false);
        mockAgendamentoRepo.criar.mockImplementation(a => Promise.resolve(a));

        const result = await agendarComVoucherUseCase.execute({
            pacienteId: 10,
            profissionalId: 20,
            voucherId: 1,
            dataInicio: dataTeste,
            dataFim: dataFimTeste
        });

        expect(result).toBeInstanceOf(AgendamentoEntity);
        expect(mockVoucher.marcarComoUsado).toHaveBeenCalled();
        expect(mockVoucherRepo.atualizar).toHaveBeenCalledWith(mockVoucher);
        expect(mockAgendamentoRepo.criar).toHaveBeenCalled();
    });

    it('deve permitir agendamento se houver um bloqueio do tipo "estrategico"', async () => {
        mockVoucherRepo.buscarPorId.mockResolvedValue({
            pacienteId: 1, profissionalId: 2, estaValido: () => true, marcarComoUsado: jest.fn()
        } as any);

        // Simula um bloqueio estratégico no horário
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([{
            tipo: 'estrategico',
            estaAtivoParaData: () => true
        }] as any);

        mockAgendamentoRepo.verificarConflito.mockResolvedValue(false);

        await expect(agendarComVoucherUseCase.execute({
            pacienteId: 1, profissionalId: 2, voucherId: 1, dataInicio: dataTeste, dataFim: dataFimTeste
        })).resolves.not.toThrow();
    });

    it('deve lançar erro 400 se houver um bloqueio que não seja estratégico', async () => {
        mockVoucherRepo.buscarPorId.mockResolvedValue({
            pacienteId: 1, profissionalId: 2, estaValido: () => true
        } as any);

        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([{
            tipo: 'feriado', // Bloqueio intransponível
            estaAtivoParaData: () => true
        }] as any);

        await expect(agendarComVoucherUseCase.execute({
            pacienteId: 1, profissionalId: 2, voucherId: 1, dataInicio: dataTeste, dataFim: dataFimTeste
        })).rejects.toEqual(new AppError("Este horário possui um bloqueio administrativo intransponível.", 400));
    });

    it('deve lançar erro 403 se o voucher não pertencer ao profissional informado', async () => {
        mockVoucherRepo.buscarPorId.mockResolvedValue({
            pacienteId: 10,
            profissionalId: 999, // Outro profissional
            estaValido: () => true
        } as any);

        await expect(agendarComVoucherUseCase.execute({
            pacienteId: 10,
            profissionalId: 20, // Profissional da requisição
            voucherId: 1,
            dataInicio: dataTeste,
            dataFim: dataFimTeste
        })).rejects.toEqual(new AppError("Este voucher não é válido para este profissional.", 403));
    });

    it('deve lançar erro 400 se já existir outro agendamento no horário (conflito)', async () => {
        mockVoucherRepo.buscarPorId.mockResolvedValue({
            pacienteId: 1, profissionalId: 2, estaValido: () => true
        } as any);
        
        mockBloqueioRepo.buscarBloqueiosAtivos.mockResolvedValue([]);
        // Simula que o repositório encontrou um conflito
        mockAgendamentoRepo.verificarConflito.mockResolvedValue({ id: 'existente' } as any);

        await expect(agendarComVoucherUseCase.execute({
            pacienteId: 1, profissionalId: 2, voucherId: 1, dataInicio: dataTeste, dataFim: dataFimTeste
        })).rejects.toEqual(new AppError("Este horário já foi ocupado por outro paciente.", 400));
    });
});