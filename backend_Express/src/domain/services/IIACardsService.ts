// src/domain/service/IIACardsService.ts

export interface IIACardsService {
  
  gerarCardsMood(input: { usuarioId: number;mood: string; intensidade: number; periodo: string; }): Promise<any>;
}
