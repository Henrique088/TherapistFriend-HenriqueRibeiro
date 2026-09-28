// src/interface/controllers/AuthController.ts

import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase'; 
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase'; 
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase'; 


export class AuthController {

    constructor(
       private loginUseCase: LoginUseCase,
       private refreshTokenUseCase: RefreshTokenUseCase,
       private logoutUseCase: LogoutUseCase
    ) { }

    // === LOGIN ===========================================================
    login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            
            const { email, senha } = req.body; 

            
            const { usuario, accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
                await this.loginUseCase.execute({ email, senha });

            // Configura cookies 
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // secure: true APENAS em produção
                sameSite: "strict",
                maxAge: accessMaxAge,
                path: "/"
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: refreshMaxAge,
                path: "api/auth" // Rota específica para renovação
            });

            return res.status(200).json({
                message: "Login realizado com sucesso",
                user: usuario // Retorna o DTO limpo (sem senha_hash)
            });
        } catch (error) {
            return next(error);
        }
    };

    // === REFRESH TOKEN ====================================================
    refresh = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // Acessa cookies através do req.cookies (necessita do 'cookie-parser' configurado)
            const refreshToken = req.cookies.refreshToken; 
            
            // Lança um erro se o token não estiver presente 
            if (!refreshToken) {
                
                // throw new AppError("Refresh token não fornecido.", 401); 
            }

            const { accessToken, refreshToken: newRefreshToken, usuario, refreshMaxAge, accessMaxAge } =
                await this.refreshTokenUseCase.execute(refreshToken);

            // Atualizar cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: accessMaxAge,
                path: "/"
            });

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: refreshMaxAge,
                path: "api/auth"
            });

            return res.status(200).json({
                message: "Tokens renovados com sucesso",
                user: usuario
            });
        } catch (error) {
            return next(error);
        }
    };

    // === LOGOUT ============================================================
    logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const refreshToken = req.cookies.refreshToken;

            // O Use Case lida com a revogação do token no DB
            await this.logoutUseCase.execute(refreshToken);

            // Apagar cookies 
            res.clearCookie("accessToken", { path: "/" });
            res.clearCookie("refreshToken", { path: "/api/auth" });

            return res.status(200).json({
                message: "Logout realizado com sucesso"
            });
        } catch (error) {
            return next(error);
        }
    };
}