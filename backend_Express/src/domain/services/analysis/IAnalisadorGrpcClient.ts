// src/domain/services/analysis/IAnalisadorGrpcClient.ts

export interface IAnalisadorGrpcClient {

    analisarFrame(request: {sessaoId: string, imagem: Buffer}): Promise<{ emocao: string; confianca: number }>;
    
    obterResumoConsolidado(request: { sessaoId: string }): Promise<any>;
}