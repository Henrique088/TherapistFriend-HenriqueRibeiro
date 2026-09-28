// src/application/use-cases/relato/AlternarLikeRelatoUseCase.ts

import { ILikeRepository } from '../../../domain/repositories/ILikeRepository';
import AppError from '../../errors/AppError';

export class AlternarLikeRelatoUseCase {
    constructor(
        private likeRepository: ILikeRepository
         
    ) {}

    async execute(usuarioId: number, relatoId: number): Promise<{ acao: 'curtido' | 'descurtido' }> {
        if (!usuarioId || !relatoId) {
            throw new AppError('Usuário e Relato são obrigatórios.', 400);
        }

        // Verifica o estado atual
        const jaCurtiu = await this.likeRepository.verificarSeJaCurtiu(usuarioId, relatoId);

        if (jaCurtiu) {
            // Se já existe, remove (Unlike)
            await this.likeRepository.removerLike(usuarioId, relatoId);
            return { acao: 'descurtido' };
        } else {
            // Se não existe, adiciona (Like)
            await this.likeRepository.darLike(usuarioId, relatoId);
            return { acao: 'curtido' };
        }
    }
}