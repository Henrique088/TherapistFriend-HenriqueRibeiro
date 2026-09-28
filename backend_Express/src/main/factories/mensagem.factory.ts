// src/main/factories/mensagemFactory.ts

import { MensagemController } from '../../interface/controllers/MensagemController';

import { contarMensagensNaoLidasUseCase, 
    deletarMensagemUseCase, 
    editarMensagemUseCase, 
    enviarMensagemUseCase, 
    listarMensagensUseCase, 
    visualizarMensagemUseCase } from '../../infrastructure/container/useCaseContainer';

export const makeMensagemController = (): MensagemController => {
    
    return new MensagemController(
        enviarMensagemUseCase, 
        listarMensagensUseCase, 
        editarMensagemUseCase, 
        visualizarMensagemUseCase, 
        deletarMensagemUseCase, 
        contarMensagensNaoLidasUseCase );
};