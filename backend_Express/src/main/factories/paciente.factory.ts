// src/main/factories/paciente.factory.ts

import { atualizarPacienteUseCase, buscarPacientePorUsuarioIdUseCase, criarPacienteUseCase } from '../../infrastructure/container/useCaseContainer';

import { PacienteController } from '../../interface/controllers/PacienteController';


export const makePacienteController = (): PacienteController => {

    return new PacienteController(
        criarPacienteUseCase,
        buscarPacientePorUsuarioIdUseCase,
        atualizarPacienteUseCase
    )
}