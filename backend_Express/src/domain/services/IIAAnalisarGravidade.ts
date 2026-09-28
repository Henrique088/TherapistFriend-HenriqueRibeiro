// src/domain/service/IIAnalisarGravidade.ts

export interface IIAnalisarGravidade {
  
  gravidade(input: { relatoId: number; texto: string;}): Promise<void>;
}
