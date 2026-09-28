// tests/unit/application/use-cases/relato/AssumirRelatoUseCase.spec.ts

import { AssumirRelatoUseCase } from './AssumirRelatoUseCase';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { RelatoFactory } from '../../../../tests/utils/factories/RelatoFactory';
import AppError from '../../errors/AppError';
import { AssumirRelatosDTO } from '../../dtos/RelatoDTO'; 

describe('AssumirRelatoUseCase', () => {
    let sut: AssumirRelatoUseCase;
    let mockRelatoRepository: jest.Mocked<IRelatoRepository>;
    let mockEventDispatcher: any; // Injetando o Dispatcher

    const makeDto = (overrides?: Partial<AssumirRelatosDTO>): AssumirRelatosDTO => ({
        relatoId: 1,
        profissionalId: 50,
        ...overrides
    });

    beforeEach(() => {
        mockRelatoRepository = {
            buscarPorId: jest.fn(),
            vincularProfissional: jest.fn(),
            buscarDadosParaNotificacao: jest.fn(),
        } as any;

        mockEventDispatcher = {
            notify: jest.fn(),
        };

        // Agora o SUT recebe o Dispatcher como dependência
        sut = new AssumirRelatoUseCase(mockRelatoRepository, mockEventDispatcher);
        
        jest.clearAllMocks();
    });

    it('deve permitir que um profissional assuma um relato e disparar evento de solicitação', async () => {
        // GIVEN
        const relatoMock = RelatoFactory.create({ id: 1 });
        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoMock);
        
        const dadosNotificacao = {
            id: 1,
            paciente_id: 10,
            titulo: 'Relato Teste',
            codinomePaciente: 'Paciente Fênix',
            nomeProfissional: 'Dr. Teste'
        };
        mockRelatoRepository.buscarDadosParaNotificacao.mockResolvedValue(dadosNotificacao);

        const dto = makeDto();

        // WHEN
        const result = await sut.execute(dto); 

        // THEN
        expect(mockRelatoRepository.vincularProfissional).toHaveBeenCalledWith(dto.relatoId, dto.profissionalId);
        
        // Verificação do Domain Event
        expect(mockEventDispatcher.notify).toHaveBeenCalled();
        const eventSpied = mockEventDispatcher.notify.mock.calls[0][0];
        
        expect(eventSpied.constructor.name).toBe('SolicitacaoConversaRecebida');
        expect(eventSpied.eventData).toEqual(expect.objectContaining({
            relatoId: 1,
            pacienteId: 10,
            nomeProfissional: 'Dr. Teste',
            tituloRelato: 'Relato Teste'
        }));

        expect(result.status).toBe('aguardando_aprovacao');
    });

    it('deve lançar erro se o relato já estiver assumido e NÃO disparar evento', async () => {
        const relatoMock = RelatoFactory.create({ status: 'em_conversa' });
        mockRelatoRepository.buscarPorId.mockResolvedValue(relatoMock);

        await expect(sut.execute(makeDto()))
            .rejects
            .toThrow(AppError);

        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });
});