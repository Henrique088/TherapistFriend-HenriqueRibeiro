// src/infrastructure/database/repositories/LikeRepository.ts

import { LikeModelStatic } from '../models/like.model';
import { ILikeRepository } from '../../../domain/repositories/ILikeRepository';
import { Transaction } from 'sequelize';

export class LikeRepository implements ILikeRepository {
  constructor(private ModelLike: LikeModelStatic) {}

  async darLike(usuarioId: number, relatoId: number, transaction?: Transaction): Promise<void> {
    // Uso do findOrCreate para evitar erros se o usuário clicar duas vezes rápido
    await this.ModelLike.findOrCreate({
      where: { usuarioId, relatoId },
      transaction
    });
  }

  async removerLike(usuarioId: number, relatoId: number, transaction?: Transaction): Promise<void> {
    await this.ModelLike.destroy({
      where: { usuarioId, relatoId },
      transaction
    });
  }

  async verificarSeJaCurtiu(usuarioId: number, relatoId: number): Promise<boolean> {
    const like = await this.ModelLike.findOne({
      where: { usuarioId, relatoId }
    });
    return !!like;
  }

  async contarLikesDoRelato(relatoId: number): Promise<number> {
    return await this.ModelLike.count({
      where: { relatoId }
    });
  }
}