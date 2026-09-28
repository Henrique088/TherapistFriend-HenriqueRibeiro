// src/application/use-cases/sessao/AvaliarSessaoUseCase.spec.ts

import { AvaliarSessaoUseCase } from './AvaliarSessaoUseCase';
import { ISessaoAvaliacaoRepository } from '../../../domain/repositories/ISessaoAvaliacaoRepository';
import { ISessionReportRepository } from "../../../domain/repositories/ISessionReportRepository";
import AppError from '../../errors/AppError';

describe('AvaliarSessaoUseCase', () => {
    let useCase: AvaliarSessaoUseCase;
    let mockAvaliacaoRepo: jest.Mocked<ISessaoAvaliacaoRepository>;
    let mockSessionReportRepo: jest.Mocked<ISessionReportRepository>;

    const inputMock = {
        sessaoId: 'sessao-123',
        pacienteId: 10,
        nota: 5,
        comentario: 'Ótimo atendimento!'
    };

    beforeEach(() => {
        mockAvaliacaoRepo = {
            buscarPorSessaoId: jest.fn(),
            salvar: jest.fn(),
        } as any;

        mockSessionReportRepo = {
            buscarPorId: jest.fn(),
        } as any;

        useCase = new AvaliarSessaoUseCase(mockAvaliacaoRepo, mockSessionReportRepo);
    });

    it('deve criar e salvar uma avaliação de sessão com sucesso', async () => {
        // Mock do relatório da sessão para obter o profissional_id real
        mockSessionReportRepo.buscarPorId.mockResolvedValue({
            id: 'sessao-123',
            profissional_id: 20
        } as any);

        mockAvaliacaoRepo.buscarPorSessaoId.mockResolvedValue(null);
        
        const avaliacaoEntityMock = {
            sessaoId: 'sessao-123',
            pacienteId: 10,
            profissionalId: 20,
            nota: 5,
            comentario: 'Ótimo atendimento!'
        };

        mockAvaliacaoRepo.salvar.mockResolvedValue(avaliacaoEntityMock as any);

        const resultado = await useCase.execute(inputMock);

        expect(mockSessionReportRepo.buscarPorId).toHaveBeenCalledWith('sessao-123');
        expect(mockAvaliacaoRepo.buscarPorSessaoId).toHaveBeenCalledWith('sessao-123');
        expect(mockAvaliacaoRepo.salvar).toHaveBeenCalledWith(expect.objectContaining({
            nota: 5,
            profissional_id: 20
        }));
        expect(resultado.nota).toBe(5);
    });

    it('deve lançar erro se a sessão já tiver sido avaliada anteriormente', async () => {
        mockSessionReportRepo.buscarPorId.mockResolvedValue({ profissional_id: 20 } as any);
        mockAvaliacaoRepo.buscarPorSessaoId.mockResolvedValue({ id: 'ja-existe' } as any);

        await expect(useCase.execute(inputMock))
            .rejects.toEqual(new AppError("Você já avaliou essa sessão."));

        expect(mockAvaliacaoRepo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a sessão (relatório) não for encontrada', async () => {
        mockSessionReportRepo.buscarPorId.mockResolvedValue(null);

        await expect(useCase.execute(inputMock))
            .rejects.toEqual(new AppError('Sessão inválida para avaliar o profissional'));
    });

    it('deve falhar se a nota for inválida (regra da entidade)', async () => {
        mockSessionReportRepo.buscarPorId.mockResolvedValue({ profissional_id: 20 } as any);
        mockAvaliacaoRepo.buscarPorSessaoId.mockResolvedValue(null);

        const inputNotaInvalida = { ...inputMock, nota: 10 };

        // Aqui o erro deve vir do SessaoAvaliacaoEntity.create
        await expect(useCase.execute(inputNotaInvalida))
            .rejects.toThrow(); // Ou a mensagem específica que você colocou na Entity
    });
});