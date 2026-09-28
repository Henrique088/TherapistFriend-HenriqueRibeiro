// src/main/factories/like.factory.ts

import { LikeController } from '../../interface/controllers/LikeController';
import { alternarLikeUseCase } from '../../infrastructure/container/useCaseContainer';

export const makeLikeController = (): LikeController => {
    
    return new LikeController(alternarLikeUseCase);
};