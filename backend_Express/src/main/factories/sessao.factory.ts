// src/main/factories/sessao.factory.ts


import { SessaoController } from "../../interface/controllers/SessaoController";

import { avaliarSessaoUseCase, 
    comentarRelatorioUseCase, 
    encerrarSessaoUseCase, 
    gerarAcessoUseCase, 
    listarRelatoriosUseCase, 
    obterRelatorioSessaoUseCase } from "../../infrastructure/container/useCaseContainer";


export const makeSessaoController = (): SessaoController => {

    return new SessaoController(
        encerrarSessaoUseCase,
        obterRelatorioSessaoUseCase,
        gerarAcessoUseCase,
        listarRelatoriosUseCase,
        comentarRelatorioUseCase,
        avaliarSessaoUseCase
    )
} 