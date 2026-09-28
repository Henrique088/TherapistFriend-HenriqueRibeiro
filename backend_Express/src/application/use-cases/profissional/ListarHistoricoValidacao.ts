// src/application/use-cases/profissional/ListarHistoricoValidacaoUseCase.ts

import { IHistoricoValidacaoRepository } from '../../../domain/repositories/IHistoricoValidacao';
import {historicoResponseDTO } from '../../dtos/ProfissionaisDTO';
import AppError from '../../errors/AppError';

export class ListarHistoricoValidacaoUseCase {
  constructor(
    private profissionalRepoitory: IHistoricoValidacaoRepository,
  ) {}

  async execute(usuarioId: number): Promise<historicoResponseDTO[]> {

        const historico = await this.profissionalRepoitory.findByProfessionalId(usuarioId);

        return historico;
  }
}