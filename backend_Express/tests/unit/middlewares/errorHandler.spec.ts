// tests/unit/middlewares/errorHandler.spec.ts

import errorHandler from '../../../src/interface/http/middlewares/errorHandler';
import AppError from '../../../src/application/errors/AppError';
import { Request, Response, NextFunction } from 'express';

describe('ErrorHandler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};

    // Mockamos os métodos de resposta do Express
    res = {
      status: jest.fn().mockReturnThis(), // .mockReturnThis() substitui o () => res
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    // Espiamos o console.error para evitar poluir o terminal
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('deve retornar o status e a mensagem definidos no AppError', () => {
    // 1. Simula um erro de aplicação (ex: 401 Unauthorized)
    const appError = new AppError('Token de acesso expirado', 401);

    // 2. Executa o handler
    errorHandler(appError, req as Request, res as Response, next);

    // 3. Asserções
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      sucesso: false,
      erro: 'Token de acesso expirado',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 500 e mensagem genérica para erros internos (TypeError)', () => {
    const internalError = new TypeError('Cannot read property of null');

    errorHandler(internalError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      sucesso: false,
      erro: 'Erro interno no servidor',
    });
    expect(console.error).toHaveBeenCalled();
  });

  test('deve retornar 500 se o erro não for AppError e não tiver status definido', () => {
    const genericError = new Error('Erro de conexão com o banco');

    errorHandler(genericError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      sucesso: false,
      erro: 'Erro interno no servidor',
    });
  });
});