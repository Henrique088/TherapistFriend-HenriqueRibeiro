// src/application/use-cases/chat/ContarMensagensNaoLidasUseCase.ts


import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { ContarNaoLidasDTO, UsuarioMensagemDTO } from '../../dtos/MensagemDTO';


export class ContarMensagensNaoLidasUseCase {
    constructor(private mensagemRepository: IMensagemRepository) {}

    async execute({ usuarioId }: UsuarioMensagemDTO): Promise<ContarNaoLidasDTO> {
        // Executa ambos em paralelo para ser mais rápido
        const [total, contagensPorConversa] = await Promise.all([
            this.mensagemRepository.contarTotalNaoLidas(usuarioId),
            this.mensagemRepository.contarNaoLidasAgrupadoPorConversa(usuarioId)
        ]);

        return { 
            total, 
            contagensPorConversa 
        };
    }
}