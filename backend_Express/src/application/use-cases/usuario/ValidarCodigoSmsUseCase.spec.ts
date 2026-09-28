// src/application/use-cases/usuario/ValidarCodigoSmsUseCase.spec.ts

import { ValidarCodigoSmsUseCase } from './ValidarCodigoSmsUseCase';
import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import AppError from '../../errors/AppError';

describe('ValidarCodigoSmsUseCase', () => {
    let useCase: ValidarCodigoSmsUseCase;
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

        useCase = new ValidarCodigoSmsUseCase(mockValidacaoRepo, mockUsuarioRepo);
    });

    it('deve validar o telefone do usuário com sucesso quando o código SMS for correto', async () => {
        const usuarioMock = {
            id: 10,
            email: 'henrique@teste.com',
            telefoneValidado: jest.fn(), // Regra de domínio
        };

        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(usuarioMock as any);
        mockValidacaoRepo.buscarCodigoValido.mockResolvedValue(true);

        await useCase.execute({ email: 'henrique@teste.com', codigo: '654321' });

        // Garante que a busca foi específica para o tipo SMS
        expect(mockValidacaoRepo.buscarCodigoValido).toHaveBeenCalledWith(10, '654321', 'SMS');
        
        // Verifica se a entidade foi atualizada e salva
        expect(usuarioMock.telefoneValidado).toHaveBeenCalled();
        expect(mockUsuarioRepo.salvar).toHaveBeenCalledWith(usuarioMock);
        
        // Garante a limpeza do banco para evitar reuso do código
        expect(mockValidacaoRepo.invalidarCodigos).toHaveBeenCalledWith(10, 'SMS');
    });

    it('deve lançar erro 404 se o usuário não for encontrado pelo e-mail', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(null);

        await expect(useCase.execute({ email: 'desconhecido@teste.com', codigo: '123456' }))
            .rejects.toEqual(new AppError('Usuário não encontrado.', 404));
        
        expect(mockValidacaoRepo.buscarCodigoValido).not.toHaveBeenCalled();
    });

    it('deve lançar erro 400 se o código SMS for inválido ou já tiver expirado', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue({ id: 10 } as any);
        mockValidacaoRepo.buscarCodigoValido.mockResolvedValue(false);

        await expect(useCase.execute({ email: 'henrique@teste.com', codigo: '000000' }))
            .rejects.toEqual(new AppError('Código inválido ou expirado.', 400));

        expect(mockUsuarioRepo.salvar).not.toHaveBeenCalled();
        expect(mockValidacaoRepo.invalidarCodigos).not.toHaveBeenCalled();
    });
});