// src/application/use-cases/usuario/ObterPerfilUsuarioUseCase.spec.ts

import { ObterPerfilUsuarioUseCase } from './ObterPerfilUsuarioUseCase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import AppError from '../../errors/AppError';

describe('ObterPerfilUsuarioUseCase', () => {
    let useCase: ObterPerfilUsuarioUseCase;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;
    let mockPacienteRepo: jest.Mocked<IPacienteRepository>;
    let mockProfissionalRepo: jest.Mocked<IProfissionalRepository>;

    beforeEach(() => {
        mockUsuarioRepo = { buscarPorId: jest.fn() } as any;
        mockPacienteRepo = { buscarPorUsuarioId: jest.fn() } as any;
        mockProfissionalRepo = { buscarPorUsuarioComHistorico: jest.fn() } as any;

        useCase = new ObterPerfilUsuarioUseCase(
            mockUsuarioRepo,
            mockPacienteRepo,
            mockProfissionalRepo
        );
    });

    it('deve retornar o perfil completo de um PACIENTE', async () => {
        const usuarioMock = {
            id: 1,
            nome: 'Henrique',
            tipo_usuario: 'paciente',
            toJSON: () => ({ id: 1, nome: 'Henrique', tipo_usuario: 'paciente' })
        };

        const pacienteMock = { id: 10, codinome: 'Lobo Solitário' };

        mockUsuarioRepo.buscarPorId.mockResolvedValue(usuarioMock as any);
        mockPacienteRepo.buscarPorUsuarioId.mockResolvedValue(pacienteMock as any);

        const resultado = await useCase.execute({ id: 1 });

        expect(mockUsuarioRepo.buscarPorId).toHaveBeenCalledWith(1);
        expect(mockPacienteRepo.buscarPorUsuarioId).toHaveBeenCalledWith(1);
        expect(mockProfissionalRepo.buscarPorUsuarioComHistorico).not.toHaveBeenCalled();
        
        expect(resultado.perfil).toEqual(pacienteMock);
        expect(resultado.nome).toBe('Henrique');
    });

    it('deve retornar o perfil completo de um PROFISSIONAL com seu histórico', async () => {
        const usuarioMock = {
            id: 2,
            nome: 'Dr. Silva',
            tipo_usuario: 'profissional',
            toJSON: () => ({ id: 2, nome: 'Dr. Silva', tipo_usuario: 'profissional' })
        };

        const profissionalMock = { id: 20, crp: '12345', historico: [] };

        mockUsuarioRepo.buscarPorId.mockResolvedValue(usuarioMock as any);
        mockProfissionalRepo.buscarPorUsuarioComHistorico.mockResolvedValue(profissionalMock as any);

        const resultado = await useCase.execute({ id: 2 });

        expect(mockProfissionalRepo.buscarPorUsuarioComHistorico).toHaveBeenCalledWith(2);
        expect(mockPacienteRepo.buscarPorUsuarioId).not.toHaveBeenCalled();
        expect(resultado.perfil).toEqual(profissionalMock);
    });

    it('deve retornar apenas dados básicos se o usuário for ADMIN (sem perfil complementar)', async () => {
        const usuarioMock = {
            id: 3,
            nome: 'Admin',
            tipo_usuario: 'admin',
            toJSON: () => ({ id: 3, nome: 'Admin', tipo_usuario: 'admin' })
        };

        mockUsuarioRepo.buscarPorId.mockResolvedValue(usuarioMock as any);

        const resultado = await useCase.execute({ id: 3 });

        expect(resultado.perfil).toBeNull();
    });

    it('deve lançar erro 404 se o usuário não existir', async () => {
        mockUsuarioRepo.buscarPorId.mockResolvedValue(null);

        await expect(useCase.execute({ id: 999 }))
            .rejects.toEqual(new AppError('Usuário não encontrado', 404));
    });
});