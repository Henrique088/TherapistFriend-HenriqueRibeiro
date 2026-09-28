// src/application/use-cases/usuario/ValidarCodigoEmailUseCase.spec.ts

import { ValidarCodigoEmailUseCase } from './ValidarCodigoEmailUseCase';
import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import AppError from '../../errors/AppError';

describe('ValidarCodigoEmailUseCase', () => {
    let useCase: ValidarCodigoEmailUseCase;
    let mockValidacaoRepo: jest.Mocked<IValidacaoRepository>;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;

    beforeEach(() => {
        mockValidacaoRepo = {
            buscarCodigoValido: jest.fn(),
            invalidarCodigos: jest.fn(),
        } as any;

        mockUsuarioRepo = {
            buscarPorEmail: jest.fn(),
            salvar: jest.fn(),
        } as any;

        useCase = new ValidarCodigoEmailUseCase(mockValidacaoRepo, mockUsuarioRepo);
    });

    it('deve validar o e-mail do usuário com sucesso quando o código for correto', async () => {
        const usuarioMock = {
            id: 1,
            email: 'henrique@teste.com',
            emailValidado: jest.fn(), // Método da entidade
        };

        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(usuarioMock as any);
        mockValidacaoRepo.buscarCodigoValido.mockResolvedValue(true);

        await useCase.execute({ email: 'henrique@teste.com', codigo: '123456' });

        // Verifica se consultou o código correto para o tipo EMAIL
        expect(mockValidacaoRepo.buscarCodigoValido).toHaveBeenCalledWith(1, '123456', 'EMAIL');
        
        // Verifica se chamou o método de negócio da entidade
        expect(usuarioMock.emailValidado).toHaveBeenCalled();
        
        // Verifica a persistência e a limpeza de códigos antigos
        expect(mockUsuarioRepo.salvar).toHaveBeenCalledWith(usuarioMock);
        expect(mockValidacaoRepo.invalidarCodigos).toHaveBeenCalledWith(1, 'EMAIL');
    });

    it('deve lançar erro se o usuário não existir', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(null);

        await expect(useCase.execute({ email: 'fake@email.com', codigo: '000000' }))
            .rejects.toEqual(new AppError('Email não cadastrado para validar', 400));
        
        expect(mockValidacaoRepo.buscarCodigoValido).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o código for inválido ou estiver expirado', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue({ id: 1 } as any);
        mockValidacaoRepo.buscarCodigoValido.mockResolvedValue(false);

        await expect(useCase.execute({ email: 'henrique@teste.com', codigo: '000000' }))
            .rejects.toEqual(new AppError('Código de e-mail inválido ou expirado.', 400));

        expect(mockUsuarioRepo.salvar).not.toHaveBeenCalled();
    });
});