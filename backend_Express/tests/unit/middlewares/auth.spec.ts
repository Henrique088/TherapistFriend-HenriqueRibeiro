// tests/unit/middlewares/auth.spec.ts

import autenticarJWT from '../../../src/interface/http/middlewares/auth';
import jwt from 'jsonwebtoken';
import AppError from '../../../src/application/errors/AppError';
import { Request, Response, NextFunction } from 'express';

// Mock do jsonwebtoken
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        // Reiniciamos os mocks antes de cada teste
        req = {
            cookies: {}
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    test('deve chamar next() com AppError se não houver token nos cookies', () => {
        // 1. Executa o middleware
        autenticarJWT(req as Request, res as Response, next);

        // 2. Verificações
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        const errorPassed = (next as jest.Mock).mock.calls[0][0];
        expect(errorPassed.message).toBe('Token de acesso não fornecido');
        expect(errorPassed.statusCode).toBe(401);
    });

    test('deve atribuir dados ao req e chamar next() se o token for válido', () => {
        const tokenSimulado = 'jwt.valido.aqui';
        req.cookies = { accessToken: tokenSimulado };

        // 1. Configuramos o mock do verify para retornar um payload válido
        const decodedPayload = { id: 1, tipo_usuario: 'profissional' };
        mockedJwt.verify.mockImplementation(() => decodedPayload);

        // 2. Executa o middleware
        autenticarJWT(req as Request, res as Response, next);

        // 3. Verificações
        // Verificamos se os dados foram injetados no objeto de request
        // Nota: se você usa 'req.usuario', verifique se o middleware não está usando 'req.user'
        const user = (req as any).usuario; 
        expect(user.id).toBe(1);
        expect(user.tipo).toBe('profissional');

        expect(next).toHaveBeenCalledWith(); // Sucesso chama next sem argumentos
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('deve chamar next(AppError) se o tipo de usuário for desconhecido', () => {
        req.cookies = { accessToken: 'token.tipo.invalido' };

        // 1. Payload com tipo inexistente no sistema
        mockedJwt.verify.mockImplementation(() => ({ 
            id: 2, 
            tipo_usuario: 'hacker' 
        }));

        // 2. Executa o middleware
        autenticarJWT(req as Request, res as Response, next);

        // 3. Verificações
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        const errorPassed = (next as jest.Mock).mock.calls[0][0];
        expect(errorPassed.message).toBe('Tipo de usuário inválido');
    });

    test('deve chamar next(AppError) se o token for inválido ou expirado', () => {
        req.cookies = { accessToken: 'token.expirado' };

        // Simulamos que o JWT disparou um erro de verificação
        mockedJwt.verify.mockImplementation(() => {
            throw new Error('jwt expired');
        });

        autenticarJWT(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        const errorPassed = (next as jest.Mock).mock.calls[0][0];
        expect(errorPassed.message).toBe('Token inválido');
    });
});