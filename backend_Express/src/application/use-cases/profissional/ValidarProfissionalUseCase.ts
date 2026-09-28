// src/modules/professionals/application/use-cases/ValidarProfissionalUseCase.ts

import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { IHistoricoValidacaoRepository } from '../.././../domain/repositories/IHistoricoValidacao';
import { ValidarProfissionalDTO } from '../../dtos/ProfissionaisDTO';
import AppError from '../../errors/AppError';

export class ValidarProfissionalUseCase {
  constructor(
    private profissionalRepoitory: IProfissionalRepository,
    private historicoValidacaoRepository: IHistoricoValidacaoRepository
  ) {}

  async execute(data: ValidarProfissionalDTO): Promise<void> {
    // Busca o profissional através do repositório
    const profissional = await this.profissionalRepoitory.buscarPorUsuarioId(data.profissionalId);

    if (!profissional) {
      throw new AppError("Profissional não encontrado.");
    }

    // Aplica a regra de negócio na ENTIDADE de Domínio
    if (data.status === 'validado') {
      profissional.validar(data.adminId);
    } else {
      profissional.revogar(data.adminId);
    }

    // Salva a alteração no banco (Persistência)
    await this.profissionalRepoitory.validarProfissional(profissional);

    // Registra no histórico de auditoria
    await this.historicoValidacaoRepository.save({
      profissional_id: data.profissionalId,
      admin_id: data.adminId,
      status: data.status,
      motivo: data.motivo || 'Sem motivo especificado',
    });
  }
}