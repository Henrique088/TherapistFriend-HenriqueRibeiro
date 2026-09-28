// tests/unit/application/use-cases/paciente/AtualizarPacienteUseCase.spec.ts

import { AtualizarPacienteUseCase } from './AtualizarPacienteUseCase';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { PacienteEntity } from '../../../domain/entities/PacienteEntity';
import AppError from '../../errors/AppError';

describe('AtualizarPacienteUseCase', () => {
    let sut: AtualizarPacienteUseCase;
    let mockPacienteRepo: jest.Mocked<IPacienteRepository>;
    let pacienteMock: PacienteEntity;

    const dtoAtualizacao = {
        idUsuario: 1,
        codinome: 'NovoCodinome'
    };

    beforeEach(() => {
        // Instância limpa criada a cada teste
        pacienteMock = new PacienteEntity({
        id: 1,
        idUsuario: 1,
        codinome: 'HeroiAntigo',
        criadoEm: new Date(),
        atualizadoEm: new Date()
    });

        mockPacienteRepo = {
            buscarPorUsuarioId: jest.fn(),
            buscarPorCodinome: jest.fn(),
            salvar: jest.fn(),
            buscarPorId: jest.fn()
        } as any;

        sut = new AtualizarPacienteUseCase(mockPacienteRepo);
    });

    it('deve atualizar e salvar o codinome do paciente com sucesso', async () => {
        mockPacienteRepo.buscarPorUsuarioId.mockResolvedValue(pacienteMock);
        mockPacienteRepo.buscarPorCodinome.mockResolvedValue(false as any);
        mockPacienteRepo.salvar.mockResolvedValue();

        const spyDefinirCodinome = jest.spyOn(pacienteMock, 'definirCodinome');

        const resultado = await sut.execute(dtoAtualizacao);

        expect(mockPacienteRepo.buscarPorUsuarioId).toHaveBeenCalledWith(1);
        expect(mockPacienteRepo.buscarPorCodinome).toHaveBeenCalledWith('NovoCodinome');
        expect(spyDefinirCodinome).toHaveBeenCalledWith('NovoCodinome');
        expect(mockPacienteRepo.salvar).toHaveBeenCalledWith(pacienteMock);
        expect(resultado).toEqual(pacienteMock.toJSON());
    });

    it('deve lançar erro 400 se o codinome desejado já estiver em uso por outro usuário', async () => {
        mockPacienteRepo.buscarPorUsuarioId.mockResolvedValue(pacienteMock);
        mockPacienteRepo.buscarPorCodinome.mockResolvedValue(true as any);

        await expect(sut.execute(dtoAtualizacao))
            .rejects.toEqual(new AppError("Codinome já está em uso. Por favor, escolha outro.", 400));

        expect(mockPacienteRepo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar erro 404 se o paciente não for encontrado pelo idUsuario', async () => {
        mockPacienteRepo.buscarPorUsuarioId.mockResolvedValue(null);
        mockPacienteRepo.buscarPorCodinome.mockResolvedValue(false as any);

        await expect(sut.execute(dtoAtualizacao))
            .rejects.toEqual(new AppError("Paciente não encontrado.", 404));

        expect(mockPacienteRepo.salvar).not.toHaveBeenCalled();
    });

    it('não deve alterar o codinome caso o parâmetro venha undefined ou null', async () => {
        mockPacienteRepo.buscarPorUsuarioId.mockResolvedValue(pacienteMock);
        mockPacienteRepo.buscarPorCodinome.mockResolvedValue(false as any);
        mockPacienteRepo.salvar.mockResolvedValue();

        const spyDefinirCodinome = jest.spyOn(pacienteMock, 'definirCodinome');

        const dtoSemCodinome = { idUsuario: 1, codinome: undefined };
        await sut.execute(dtoSemCodinome as any);

        expect(spyDefinirCodinome).not.toHaveBeenCalled();
        expect(mockPacienteRepo.salvar).toHaveBeenCalledWith(pacienteMock);
    });
});