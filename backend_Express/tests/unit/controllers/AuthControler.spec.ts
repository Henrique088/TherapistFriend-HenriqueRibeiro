// tests/unit/interface/controllers/AuthController.spec.ts

import { AuthController } from '../../../src/interface/controllers/AuthController';
import AppError from '../../../src/application/errors/AppError';
import { Request, Response, NextFunction } from 'express';

describe('AuthController', () => {
    let mockLoginUseCase: any;
    let mockRefreshTokenUseCase: any;
    let mockLogoutUseCase: any;
    let controller: AuthController;

    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    const ACCESS_MAX_AGE = 7200000; 
    const REFRESH_MAX_AGE = 604800000;

    beforeEach(() => {
        // Mocks dos Use Cases
        mockLoginUseCase = { execute: jest.fn() };
        mockRefreshTokenUseCase = { execute: jest.fn() };
        mockLogoutUseCase = { execute: jest.fn() };

        controller = new AuthController(
            mockLoginUseCase,
            mockRefreshTokenUseCase,
            mockLogoutUseCase
        );

        // Mocks do Express com suporte a encadeamento (chaining)
        req = {
            body: {},
            cookies: {},
        };
        res = {
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    describe('login', () => {
        const fakeUser = { id: 1, email: 'test@mail.com', nome: 'Test' };
        const fakeAccess = 'access_token_123';
        const fakeRefresh = 'refresh_token_456';

        test('deve chamar o loginUseCase e configurar cookies de segurança', async () => {
            req.body = { email: 'test@mail.com', senha: 'password' };
            mockLoginUseCase.execute.mockResolvedValue({
                usuario: fakeUser,
                accessToken: fakeAccess,
                refreshToken: fakeRefresh,
                accessMaxAge: ACCESS_MAX_AGE,
                refreshMaxAge: REFRESH_MAX_AGE,
            });

            await controller.login(req as Request, res as Response, next);

            // Verificação dos Cookies
            expect(res.cookie).toHaveBeenCalledWith("accessToken", fakeAccess, expect.objectContaining({
                httpOnly: true,
                maxAge: ACCESS_MAX_AGE,
                path: "/",
            }));

            expect(res.cookie).toHaveBeenCalledWith("refreshToken", fakeRefresh, expect.objectContaining({
                httpOnly: true,
                maxAge: REFRESH_MAX_AGE,
                path: "api/auth",
            }));

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                user: fakeUser
            }));
        });

        test('deve capturar erro no login e passar para o middleware de erro', async () => {
            const error = new AppError('Credenciais inválidas', 401);
            mockLoginUseCase.execute.mockRejectedValue(error);

            await controller.login(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('refresh', () => {
        test('deve renovar tokens usando o cookie refreshToken', async () => {
            const oldRefresh = 'old_token';
            req.cookies = { refreshToken: oldRefresh };
            
            mockRefreshTokenUseCase.execute.mockResolvedValue({
                accessToken: 'new_access',
                refreshToken: 'new_refresh',
                user: { id: 1 },
                accessMaxAge: ACCESS_MAX_AGE,
                refreshMaxAge: REFRESH_MAX_AGE,
            });

            await controller.refresh(req as Request, res as Response, next);

            expect(mockRefreshTokenUseCase.execute).toHaveBeenCalledWith(oldRefresh);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('logout', () => {
        test('deve limpar os cookies e revogar o token no banco', async () => {
            const token = 'active_token';
            req.cookies = { refreshToken: token };
            mockLogoutUseCase.execute.mockResolvedValue(undefined);

            await controller.logout(req as Request, res as Response, next);

            expect(mockLogoutUseCase.execute).toHaveBeenCalledWith(token);
            expect(res.clearCookie).toHaveBeenCalledWith("accessToken", { path: "/" });
            expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", { path: "/api/auth" });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});