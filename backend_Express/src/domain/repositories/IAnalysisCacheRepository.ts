// src/domain/repositories/IAnalysisCacheRepository.ts

export interface IAnalysisCacheRepository {

    adicionarFrame(sessaoId: string, data: any): Promise<void>;

    buscarTodosFrames(sessaoId: string): Promise<any[]>;
    
    limparDados(sessaoId: string): Promise<void>;
}