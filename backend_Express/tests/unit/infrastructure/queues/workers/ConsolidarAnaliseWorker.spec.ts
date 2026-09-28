// tests/unit/infrastructure/queues/workers/ConsolidarAnaliseWorker.spec.ts

import { setupConsolidarAnaliseWorker } from '../../../../../src/infrastructure/queue/workers/ConsolidarAnaliseWorker';
import { Worker } from 'bullmq';

// 1. Criamos a variável para capturar a função
let capturedProcessor: any;

// 2. Mockamos o BullMQ ANTES do describe
jest.mock('bullmq', () => {
    return {
        Worker: jest.fn().mockImplementation((name, processor) => {
            capturedProcessor = processor; // Captura a função aqui!
            return { on: jest.fn() };
        })
    };
});

describe('ConsolidarAnaliseWorker', () => {
    let mockEventDispatcher: any;
    let mockGrpcClient: any;

    beforeEach(() => {
        capturedProcessor = undefined;
        jest.clearAllMocks();

        mockEventDispatcher = { notify: jest.fn() };
        mockGrpcClient = {
            obterResumoConsolidado: jest.fn()
        };

        // Inicializa o worker para que o capturedProcessor seja preenchido
        setupConsolidarAnaliseWorker(mockEventDispatcher, mockGrpcClient);
    });

    const mockJob = (data: any) => ({
        id: 'job_123',
        data,
    }) as any;

    it('deve chamar o gRPC e disparar RelatorioSessaoFinalizado quando o job for processado', async () => {
        // Arrange
        const jobData = { sessaoId: 'sessao_abc', pacienteId: 10, profissionalId: 50 };
        const gRPCResponse = {
            emocaoDominante: 'calma',
            picosAnsiedade: 2,
            jsonGraficos: '{}'
        };
        mockGrpcClient.obterResumoConsolidado.mockResolvedValue(gRPCResponse);

        // Act - Agora o capturedProcessor existe!
        await capturedProcessor(mockJob(jobData));

        // Assert
        expect(mockGrpcClient.obterResumoConsolidado).toHaveBeenCalledWith({ sessaoId: 'sessao_abc' });
        expect(mockEventDispatcher.notify).toHaveBeenCalled();
        
        const eventSpied = mockEventDispatcher.notify.mock.calls[0][0];
        expect(eventSpied.constructor.name).toBe('RelatorioSessaoFinalizado');
    });

    it('deve lançar erro se o gRPC falhar', async () => {
        // Arrange
        mockGrpcClient.obterResumoConsolidado.mockRejectedValue(new Error('gRPC Offline'));

        // Act & Assert
        await expect(capturedProcessor(mockJob({ sessaoId: '123' })))
            .rejects.toThrow('gRPC Offline');
    });
});