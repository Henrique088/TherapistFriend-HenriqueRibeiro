// src/application/use-cases/profissional/PerfilPublicoProfissional.ts

import { IProfissionalRepository } from "../../../domain/repositories/IProfissionalRepository";
import { ISessaoAvaliacaoRepository } from "../../../domain/repositories/ISessaoAvaliacaoRepository";
import { PerfilPublicoResponseDTO } from "../../dtos/ProfissionaisDTO";
import AppError from "../../errors/AppError";

export class PerfilPublicoProfissional {

    constructor(
        private profissionalRepository: IProfissionalRepository,
        private sessaoAvaliacaoRepository: ISessaoAvaliacaoRepository
    ){}

    async execute(profissionalId: number): Promise<PerfilPublicoResponseDTO> {
        // 1. Busca os dados do profissional (deve incluir biografia, especialidade, etc)
        const profissional = await this.profissionalRepository.buscarPorUsuarioId(profissionalId);

        if (!profissional) {
            throw new AppError("Erro ao buscar perfil público. Por favor, tente novamente mais tarde.");
        }

        // 2. Busca estatísticas (Média e Total)
        const stats = await this.sessaoAvaliacaoRepository.obterEstatisticasProfissional(profissional.id_usuario);

        // 3. Busca os 5 comentários mais recentes
        const avaliacoesRecentes = await this.sessaoAvaliacaoRepository.listarPorProfissional(profissional.id_usuario, 5);

        // 4. Retorno formatado seguindo o DTO
        return {
            id: profissional.id || 0,
            nome: profissional.nome ?? 'Profissional',
            // fotoPerfil: profissional.foto_perfil,
            crp: profissional.crp || 'Não informado',
            especialidade: profissional.especialidades || 'Psicólogo(a)',
            biografia: profissional.bio || 'Sem biografia disponível.',
            mediaNotas: Number(stats.media),
            totalAvaliacoes: stats.totalAvaliacoes,
            comentarios: avaliacoesRecentes.map(av => ({
                nota: av.nota,
                texto: av.comentario,
                data: av.dataAvaliacao || new Date(),
                nomePaciente: "ANÔNIMO" 
            }))
        };
    }
}