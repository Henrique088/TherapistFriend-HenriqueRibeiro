// src/infrastructure/database/repositories/HistoricoValidacao.ts


import { IHistoricoValidacaoRepository } from "../../../domain/repositories/IHistoricoValidacao";
import { HistoricoValidacaoAttributes, HistoricoValidacaoModel } from "../models/historico_validacao_profissional.model";


export class HistoricoValidacaoRepository implements IHistoricoValidacaoRepository {

  constructor(
    private historicoValidacaoModel: typeof HistoricoValidacaoModel,

  ) { }

  async save(data: Omit<HistoricoValidacaoAttributes, "id" | "data_decisao">): Promise<void> {
    await this.historicoValidacaoModel.create({
      profissional_id: data.profissional_id,
      admin_id: data.admin_id,
      status: data.status,
      motivo: data.motivo
    });
  }

  async findByProfessionalId(professionalId: number): Promise<HistoricoValidacaoAttributes[]> {
    return await this.historicoValidacaoModel.findAll({
      where: { profissional_id: professionalId },
      order: [['data_decisao', 'DESC']],

      include: [{
        association: 'admin',
        attributes: ['nome', 'id']
      }]
    });
  }




}