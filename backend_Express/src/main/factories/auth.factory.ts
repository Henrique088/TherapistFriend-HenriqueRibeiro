// src/main/factories/auth.factory.ts

// Controller (Interface)
import { AuthController } from '../../interface/controllers/AuthController';


import { loginUseCase, logoutUseCase, refreshTokenUseCase } from '../../infrastructure/container/useCaseContainer';


export const makeAuthController = (): AuthController => {

    return new AuthController(
        loginUseCase,
        refreshTokenUseCase,
        logoutUseCase
    )
}