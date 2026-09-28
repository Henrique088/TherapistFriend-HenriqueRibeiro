// src/infrastructure/services/IAAnalisarGravidade.ts

import AppError from "../../application/errors/AppError";
import { IRelatoRepository } from "../../domain/repositories/IRelatoRepository";
import { IIAnalisarGravidade } from "../../domain/services/IIAAnalisarGravidade";

interface gravidadeInput {
    relatoId: number;
    texto: string;
}
export class AnalisarGravidade implements IIAnalisarGravidade {

    constructor(private relatoRepository: IRelatoRepository) { }
    async gravidade({ relatoId, texto }: gravidadeInput): Promise<void> {
        try {
            const textoCodificado = encodeURIComponent(texto);
            const response = await fetch(`${process.env.IA_SERVICE_URL}/classificar-gravidade?texto=${textoCodificado}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new AppError(`Erro na API de IA: ${response.status}`);
            }

            const data = await response.json() as { gravidade: string };
            const resultadoFinal = data.gravidade || 'indeterminado';

            // Atualiza o banco de dados usando o Repositório
            await this.relatoRepository.atualizarResultadoIA(relatoId, resultadoFinal);

            console.log(`[Worker] Sucesso: Relato ${relatoId} classificado como ${resultadoFinal}`);

        } catch (error) {


            // Lançar o erro aqui faz o BullMQ tentar novamente (Retry) automaticamente
            throw error;

        }
    }
}