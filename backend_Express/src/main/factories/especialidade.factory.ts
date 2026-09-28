// src/main/factories/especialidade.factory.ts

import { listarEspecialidadesUseCase } from "../../infrastructure/container/useCaseContainer";

import { EspecialidadeController } from "../../interface/controllers/especialidadeController";



export const makeEspecialidadeController = (): EspecialidadeController => {

    return new EspecialidadeController(
        listarEspecialidadesUseCase
    )
}