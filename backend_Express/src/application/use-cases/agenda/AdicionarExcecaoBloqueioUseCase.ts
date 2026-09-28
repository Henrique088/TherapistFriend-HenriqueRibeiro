// src/application/use-cases/agenda/AdicionarExcecaoBloqueioUseCase.ts

import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import AppError from '../../errors/AppError';
import { AdicionarExcecaoDTO } from '../../dtos/AgendaDTO';


export class AdicionarExcecaoBloqueioUseCase {
    constructor(private bloqueioRepository: IBloqueioRepository) {}

    async execute(dados: AdicionarExcecaoDTO): Promise<void> {

        const d = new Date(dados.dataExcecao);

        // Extraí os componentes UTC (os números brutos do JSON)
        const ano = d.getUTCFullYear();
        const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dia = String(d.getUTCDate()).padStart(2, '0');
        
        // Monta a string pura YYYY-MM-DD
        const dataFormatada = `${ano}-${mes}-${dia}`;

      
        const bloqueio = await this.bloqueioRepository.buscarPorId(dados.bloqueioId);

       
        
        if (!bloqueio) {
            throw new AppError("Bloqueio de agenda não encontrado.", 404);
        }

        if (bloqueio.profissionalId !== dados.profissionalId) {
            throw new AppError("O bloqueio não pertence ao profissional.", 403);
        }

        // Persiste a data normalizada em UTC
        await this.bloqueioRepository.adicionarExcecao(
            dados.bloqueioId, 
            dataFormatada, 
            dados.motivo
        );
    }
}