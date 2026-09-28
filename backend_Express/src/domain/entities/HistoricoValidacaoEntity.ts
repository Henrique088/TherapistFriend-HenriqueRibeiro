// src/domain/entities/HistoricoValidacao.ts

import AppError from "../../application/errors/AppError";

export class HistoricoValidacaoEntity {
  constructor(
    public readonly professionalId: number,
    public readonly adminId: number,
    public readonly status: string,
    public readonly motivo: string | null,
    public readonly dataDecisao: Date = new Date()
  ) {
    
    // Validação básica de domínio
    if (!adminId) throw new AppError("O registro de histórico exige um Admin responsável.");
  }
}