// src/domain/repositories/IHistoricoValidacao.ts

import { HistoricoValidacaoAttributes } from '../../infrastructure/database/models/historico_validacao_profissional.model';

export interface IHistoricoValidacaoRepository {
  /**
   * Registra um novo evento de validação/reprovação no histórico.
   */
  save(data: Omit<HistoricoValidacaoAttributes, 'id' | 'data_decisao'>): Promise<void>;

  /**
   * Recupera todo o histórico de um profissional específico, ordenado pelo mais recente.
   */
  findByProfessionalId(professionalId: number): Promise<HistoricoValidacaoAttributes[]>;
}