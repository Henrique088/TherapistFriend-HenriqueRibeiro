// src/main/factories/bloqueio.fatory.ts

import { BloqueioController } from "../../interface/controllers/BloqueioController";

import { adicionarExcecaoBloqueioUseCase, criarBoqueioUseCase, removerBloqueioUseCase, removerExcecaoUseCase } from "../../infrastructure/container/useCaseContainer";



export const makeBloqueioController = (): BloqueioController => {

    return new BloqueioController(
        criarBoqueioUseCase,
        adicionarExcecaoBloqueioUseCase,
        removerBloqueioUseCase,
        removerExcecaoUseCase
    )
}