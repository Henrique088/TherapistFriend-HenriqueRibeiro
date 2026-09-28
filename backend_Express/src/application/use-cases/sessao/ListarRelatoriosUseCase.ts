import { ISessionReportRepository } from "../../../domain/repositories/ISessionReportRepository";
import { ListarRelatoriosInput, ListarRelatoriosOutput } from "../../dtos/SessaoDTO";

export class ListarRelatoriosUseCase {
    constructor(private sessionReportRepo: ISessionReportRepository) {}

    async execute(input: ListarRelatoriosInput): Promise<ListarRelatoriosOutput> {
        const page = input.page || 1;
        const limit = input.limit || 10;

        const { dados, total } = await this.sessionReportRepo.listarComFiltros(
            input.profissionalId,
            page,
            limit,
            { codinome: input.codinome, emocao: input.emocao,  ordem: input.ordem }
        );

        // Mapeamento direto do Modelo para o DTO de Saída
        const relatorios = dados.map((item: any) => ({
            id: item.id,
            sessaoId: item.session_id,
            paciente: {
                codinome: item.sessao?.agendamento?.paciente?.codinome || "N/A",
            },
            resumo: {
                emocaoPredominante: item.summary?.emocao_predominante || "Indefinida",
                confiancaMedia: item.summary?.confianca_media || 0,
                dataRealizada: item.created_at
            },
            dataCriacao: item.creatAt
        }));

        return {
            relatorios,
            paginacao: {
                totalItems: total,
                totalPaginas: Math.ceil(total / limit),
                paginaAtual: page,
                limite: limit
            }
        };
    }
}