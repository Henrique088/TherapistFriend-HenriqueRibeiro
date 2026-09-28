// src/main/factories/mensagemFactory.ts

import { ConversaController } from '../../interface/controllers/ConversaController';

import { listarConversasUseCase } from '../../infrastructure/container/useCaseContainer';

export const makeconversaController = (): ConversaController => {

    return new ConversaController(listarConversasUseCase);
};