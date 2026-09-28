// src/main/factories/notificacao.factory.ts

import { contarNotificacoesNaoLidasUseCase, listarNotificacoesUseCase, marcarNotificacaoComoLidaUseCase } from '../../infrastructure/container/useCaseContainer';

import { NotificacaoController } from '../../interface/controllers/NotificacaoController';



export const makeNotificacaoController = (): NotificacaoController => {

    return new NotificacaoController(
        contarNotificacoesNaoLidasUseCase,
        marcarNotificacaoComoLidaUseCase,
        listarNotificacoesUseCase
    )
}