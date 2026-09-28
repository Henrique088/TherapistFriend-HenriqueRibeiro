// src/main/factories/profissional.factory.ts

import { ProfissionalController } from '../../interface/controllers/ProfissionalController';

import { completarPerfilProfissionalUseCase, listarProfissionaisUseCase, perfilPublicoProfissional } from '../../infrastructure/container/useCaseContainer';


export const makeProfissionalController = (): ProfissionalController => {

    return new ProfissionalController(
        completarPerfilProfissionalUseCase,
        listarProfissionaisUseCase,
        perfilPublicoProfissional
    )
}