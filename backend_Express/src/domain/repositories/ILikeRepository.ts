import { Transaction } from 'sequelize';

export interface ILikeRepository {

  darLike(usuarioId: number, relatoId: number, transaction?: Transaction): Promise<void>;

  removerLike(usuarioId: number, relatoId: number, transaction?: Transaction): Promise<void>;

  verificarSeJaCurtiu(usuarioId: number, relatoId: number): Promise<boolean>;
  
  contarLikesDoRelato(relatoId: number): Promise<number>;
}