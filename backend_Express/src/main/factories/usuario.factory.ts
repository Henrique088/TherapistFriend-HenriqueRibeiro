// src/main/factories/usuario.factory.ts


// Controller (Interface)
import { UsuarioController } from '../../interface/controllers/UsuarioController';

import { atualizarUsuarioUseCase, 
    buscarUsuarioPorEmailUseCase, 
    buscarUsuarioPorIdUseCase, 
    desativarUsuarioUseCase, 
    enviarCodigoEmailUseCase, 
    enviarCodigoSmsUseCase, 
    obterPerfilUsuarioUseCase, 
    registrarUsuarioUseCase, 
    validarCodigoEmailUseCase, 
    validarCodigoSmsUseCase } from '../../infrastructure/container/useCaseContainer';


    
export const makeUsuarioController = (): UsuarioController => {

    return new UsuarioController(
        registrarUsuarioUseCase,
        buscarUsuarioPorEmailUseCase,
        buscarUsuarioPorIdUseCase,
        atualizarUsuarioUseCase,
        desativarUsuarioUseCase,
        obterPerfilUsuarioUseCase,
        enviarCodigoEmailUseCase,
        enviarCodigoSmsUseCase,
        validarCodigoEmailUseCase,
        validarCodigoSmsUseCase

    )
}