// src/application/use-cases/sessao/ObterRelatorioSessaoUseCase.ts

import { ISessaoRepository } from '../../../domain/repositories/ISessaoRepository';
import { ISessionReportRepository } from '../../../domain/repositories/ISessionReportRepository';
import AppError from '../../errors/AppError';
import { ObterRelatorioSessaoDTO, RelatorioSessaoOutputDTO } from '../../dtos/RelatorioDTO';

export class ObterRelatorioSessaoUseCase {
    constructor(
        private sessaoRepository: ISessaoRepository,
        private sessionReportRepository: ISessionReportRepository 
    ) {}

    async execute(dados: ObterRelatorioSessaoDTO): Promise<RelatorioSessaoOutputDTO> {

        
        // Busca a sessão base (Controle de Acesso)
        const sessao = await this.sessaoRepository.buscarPorId(dados.sessaoId);

        if (!sessao) {
            throw new AppError('Sessão não encontrada.', 404);
        }

        // Validação de segurança na Entidade de Domínio (SessaoEntity)
        sessao.podeExibirRelatorio(dados.usuarioId, dados.usuarioTipo);


        // Busca o relatório
        const relatorio = await this.sessionReportRepository.buscarPorId(dados.sessaoId);

        // Se a sessão está finalizada mas o relatório não existe no banco ainda
        if (!relatorio) {
            // Retorna 202 para o Front-end saber que deve continuar tentando (Polling)
            throw new AppError('A análise ainda está sendo processada pela IA.', 202);
        }

        // Retorno formatado unindo dados da Sessão + Relatório
        return {
            sessaoId: sessao.id,
            dataInicio: sessao.data_inicio, 
            dataFim: sessao.data_fim || null,
            status: sessao.status,
            // Dados vindos da tabela session_reports
            analise: relatorio.summary, 
            comentarioProfissional: relatorio.profissional_comment ?? undefined,
            geradoEm: relatorio.created_at ?? null
        };
    }
}