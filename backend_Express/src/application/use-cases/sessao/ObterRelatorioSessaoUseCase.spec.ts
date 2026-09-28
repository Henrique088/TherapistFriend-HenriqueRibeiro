// src/application/use-cases/sessao/ObterRelatorioSessaoUseCase.spec.ts

import { ObterRelatorioSessaoUseCase } from './ObterRelatorioSessaoUseCase';
import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { ISessionReportRepository } from '../../../domain/repositories/ISessionReportRepository';
import AppError from '../../errors/AppError';

describe('ObterRelatorioSessaoUseCase', () => {
    let useCase: ObterRelatorioSessaoUseCase;
    let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
    let mockReportRepo: jest.Mocked<ISessionReportRepository>;

    const uuidMock = '550e8400-e29b-41d4-a716-446655440000';

    beforeEach(() => {
        mockSessaoRepo = { buscarPorId: jest.fn() } as any;
        mockReportRepo = { buscarPorId: jest.fn() } as any;
        useCase = new ObterRelatorioSessaoUseCase(mockSessaoRepo, mockReportRepo);
    });

    it('deve retornar o relatório completo quando a sessão e o relatório existirem', async () => {
        const sessaoMock = {
            id: uuidMock,
            data_inicio: new Date(),
            data_fim: new Date(),
            status: 'finalizada',
            podeExibirRelatorio: jest.fn() // Regra de domínio passa
        };

        const relatorioMock = {
            summary: 'O paciente demonstrou sinais de melhora...',
            profissional_comment: 'Ótima evolução.',
            created_at: new Date()
        };

        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock as any);
        mockReportRepo.buscarPorId.mockResolvedValue(relatorioMock as any);

        const resultado = await useCase.execute({
            sessaoId: uuidMock,
            usuarioId: 10,
            usuarioTipo: 'profissional'
        });

        expect(sessaoMock.podeExibirRelatorio).toHaveBeenCalledWith(10, 'profissional');
        expect(resultado.analise).toBe(relatorioMock.summary);
        expect(resultado.sessaoId).toBe(uuidMock);
    });

    it('deve lançar erro 202 se o relatório ainda não tiver sido gerado pela IA', async () => {
        const sessaoMock = {
            id: uuidMock,
            status: 'finalizada',
            podeExibirRelatorio: jest.fn()
        };

        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock as any);
        mockReportRepo.buscarPorId.mockResolvedValue(null); // IA ainda processando

        const exec = useCase.execute({
            sessaoId: uuidMock,
            usuarioId: 10,
            usuarioTipo: 'profissional'
        });

        await expect(exec).rejects.toEqual(new AppError('A análise ainda está sendo processada pela IA.', 202));
    });

    it('deve respeitar a regra de segurança da entidade e lançar erro se o usuário não tiver permissão', async () => {
        const sessaoMock = {
            id: uuidMock,
            podeExibirRelatorio: jest.fn().mockImplementation(() => {
                throw new AppError('Não autorizado', 403);
            })
        };

        mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoMock as any);

        const exec = useCase.execute({
            sessaoId: uuidMock,
            usuarioId: 999, // Usuário intruso
            usuarioTipo: 'paciente'
        });

        await expect(exec).rejects.toThrow('Não autorizado');
        expect(mockReportRepo.buscarPorId).not.toHaveBeenCalled();
    });

    it('deve lançar erro 404 se a sessão não existir', async () => {
        mockSessaoRepo.buscarPorId.mockResolvedValue(null);

        await expect(useCase.execute({
            sessaoId: uuidMock,
            usuarioId: 1,
            usuarioTipo: 'admin'
        })).rejects.toEqual(new AppError('Sessão não encontrada.', 404));
    });
});