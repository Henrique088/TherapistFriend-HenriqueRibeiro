// src/main/factories/relato.factory.ts

import { RelatoController } from '../../interface/controllers/RelatosController';

import { assumirRelatoUseCase, 
    atualizarRelatoUseCase, 
    criarRelatoUseCase, 
    decidirVinculoUseCase, 
    deletarRelatoUseCase, 
    listarRelatosDisponiveisUseCase, 
    listarRelatosParaPacientesUseCase, 
    recusarRelatoUseCase } from '../../infrastructure/container/useCaseContainer';

    
export const makeRelatoController = (): RelatoController => {

    return new RelatoController(
        criarRelatoUseCase,
        assumirRelatoUseCase,
        decidirVinculoUseCase,
        recusarRelatoUseCase,
        listarRelatosDisponiveisUseCase,
        listarRelatosParaPacientesUseCase,
        deletarRelatoUseCase,
        atualizarRelatoUseCase
    )
}