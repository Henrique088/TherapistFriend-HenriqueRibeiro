// src/modules/professionals/application/use-cases/ListarProfissionalParaAdminUseCase.ts

import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { ProfissionalListarAdminDTO, ProfissionalListarAdminResponseDTO } from '../../dtos/ProfissionaisDTO';
import AppError from '../../errors/AppError';

export class ListarProfissionalParaAdminUseCase {
  constructor(
    private profissionalRepoitory: IProfissionalRepository,
  ) {}

  async execute({page, limit, filtro}: ProfissionalListarAdminDTO): Promise<ProfissionalListarAdminResponseDTO> {

        const profissionais = await this.profissionalRepoitory.listarProfissionaisParaAdmin(page, limit, {...filtro});

        return profissionais;
  }
}