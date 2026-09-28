// src/application/use-cases/sessao/AvaliarSessaoUseCase.ts
import { ISessaoAvaliacaoRepository } from '../../../domain/repositories/ISessaoAvaliacaoRepository';
import { SessaoAvaliacaoEntity, SessaoAvaliacaoProps } from '../../../domain/entities/SessaoAvaliacao';
import { ISessionReportRepository } from "../../../domain/repositories/ISessionReportRepository";
import { AvaliarSessaoInput } from '../../dtos/SessaoDTO';
import AppError from '../../errors/AppError';


export class AvaliarSessaoUseCase {
    constructor(
        private sessaoAvaliacaoRepository: ISessaoAvaliacaoRepository,
        private sessionReportResitory: ISessionReportRepository
    ) {}

    async execute(input: AvaliarSessaoInput): Promise<SessaoAvaliacaoEntity> {

        const session = await this.sessionReportResitory.buscarPorId(input.sessaoId);

        if(!session) throw new AppError('Sessão inválida para avaliar o profissional');

        // Regra de Negócio: Verificar se a sessão já foi avaliada
        const avaliacaoExistente = await this.sessaoAvaliacaoRepository.buscarPorSessaoId(input.sessaoId);
        
        if (avaliacaoExistente) {
            throw new AppError("Você já avaliou essa sessão.");
        }

        // Criar a Entidade (Isso já valida a nota entre 1 e 5 automaticamente)
        const avaliacao = SessaoAvaliacaoEntity.create({
            sessaoId: input.sessaoId,
            pacienteId: input.pacienteId,
            profissionalId: session.profissional_id,
            nota: input.nota,
            comentario: input.comentario
        });

        // Persistir no Banco de Dados
        const resultado = await this.sessaoAvaliacaoRepository.salvar({
            sessao_id: avaliacao.sessaoId,
            paciente_id: avaliacao.pacienteId,
            profissional_id: avaliacao.profissionalId,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario
        });

        return resultado;
    }
}