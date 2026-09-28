// tests/unit/interface/controllers/UsuarioController.spec.ts

import { UsuarioController } from '../../../src/interface/controllers/UsuarioController';
import { Request, Response, NextFunction } from 'express';
import AppError from '../../../src/application/errors/AppError';
import { mock } from 'node:test';

describe('UsuarioController', () => {
    let controller: UsuarioController;
    
    // Mocks de todos os Use Cases
    let mockRegistrar: any;
    let mockBuscarEmail: any;
    let mockBuscarId: any;
    let mockAtualizar: any;
    let mockDesativar: any;
    let mockObterPerfil: any;
    let mockEnviarCodigoEmail: any;
    let mockEnviarCodigoSms: any;
    let mockValidarCodigoEmail: any;
    let mockValidarCodigoSms: any;

    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        // Inicializa mocks das dependências
        mockRegistrar = { execute: jest.fn() };
        mockBuscarEmail = { execute: jest.fn() };
        mockBuscarId = { execute: jest.fn() };
        mockAtualizar = { execute: jest.fn() };
        mockDesativar = { execute: jest.fn() };
        mockObterPerfil = { execute: jest.fn() };
        mockEnviarCodigoEmail = { execute: jest.fn() };
        mockEnviarCodigoSms = { execute: jest.fn() };
        mockValidarCodigoEmail = { execute: jest.fn() };
        mockValidarCodigoSms = { execute: jest.fn() };

        // Injeta os 5 mocks no construtor
        controller = new UsuarioController(
            mockRegistrar,
            mockBuscarEmail,
            mockBuscarId,
            mockAtualizar,
            mockDesativar,
            mockObterPerfil,
            mockEnviarCodigoEmail,
            mockEnviarCodigoSms,
            mockValidarCodigoEmail,
            mockValidarCodigoSms
        );

        // Mocks do Express
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    // --- TESTES: REGISTRAR ---
    describe('registrar', () => {
        it('deve registrar um usuário com sucesso (201)', async () => {
            const fakeUser = { id: 1, nome: 'Henrique' };
            req.body = { nome: 'Henrique', email: 'h@h.com', senha: '123' };
            mockRegistrar.execute.mockResolvedValue(fakeUser);

            await controller.registrar(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fakeUser);
        });
    });

    // --- TESTES: ATUALIZAR ---
    describe('atualizar', () => {
        it('deve atualizar dados do usuário com sucesso', async () => {
            req.params = { id: '10' };
            req.body = { nome: 'Nome Novo' };
            const userUpdated = { id: 10, nome: 'Nome Novo' };
            mockAtualizar.execute.mockResolvedValue(userUpdated);

            await controller.atualizar(req as Request, res as Response, next);

            expect(mockAtualizar.execute).toHaveBeenCalledWith(10, req.body);
            expect(res.json).toHaveBeenCalledWith(userUpdated);
        });

        it('deve lançar AppError se o ID for inválido (NaN)', async () => {
            req.params = { id: 'abc' };

            await controller.atualizar(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            const error = (next as jest.Mock).mock.calls[0][0];
            expect(error.message).toBe('ID inválido');
            expect(error.statusCode).toBe(400);
        });
    });

    // --- TESTES: DESATIVAR ---
    describe('desativar', () => {
        it('deve desativar usuário com sucesso', async () => {
            req.params = { id: '5' };
            mockDesativar.execute.mockResolvedValue({ mensagem: 'Usuário desativado' });

            await controller.desativar(req as Request, res as Response, next);

            expect(mockDesativar.execute).toHaveBeenCalledWith(5);
            expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário desativado' });
        });
    });

    // --- TESTES: BUSCAR POR EMAIL ---
    describe('buscarPorEmail', () => {
        it('deve retornar o usuário convertido em JSON (sem senha)', async () => {
            req.params = { email: 'test@mail.com' };
            
            // Simulando o retorno da Entidade que possui o método toJSON()
            const mockEntity = {
                toJSON: jest.fn().mockReturnValue({ id: 1, email: 'test@mail.com' })
            };
            mockBuscarEmail.execute.mockResolvedValue(mockEntity);

            await controller.buscarPorEmail(req as Request, res as Response, next);

            expect(mockEntity.toJSON).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ id: 1, email: 'test@mail.com' });
        });

        it('deve capturar erros e passar para o middleware de erro', async () => {
            req.params = { email: 'erro@test.com' };
            const error = new Error('Banco falhou');
            mockBuscarEmail.execute.mockRejectedValue(error);

            await controller.buscarPorEmail(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});