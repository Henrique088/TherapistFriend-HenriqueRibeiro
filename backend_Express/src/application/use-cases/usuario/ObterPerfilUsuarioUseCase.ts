// src/application/use-cases/usuario/ObterPerfilUsuarioUseCase.ts

import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import AppError from '../../errors/AppError';
import { BuscarPorIdUsuarioDTO } from '../../dtos/UsuarioDTO';

export class ObterPerfilUsuarioUseCase {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private pacienteRepository: IPacienteRepository,
        private profissionalRepository: IProfissionalRepository
    ) {}

    async execute( {id}: BuscarPorIdUsuarioDTO) {
        // Busca os dados base do usuário
        const usuario = await this.usuarioRepository.buscarPorId(id);
        if (!usuario) throw new AppError('Usuário não encontrado', 404);

        // Busca dados específicos conforme o tipo
        let dadosComplementares = null;

        if (usuario.tipo_usuario === 'paciente') {
            dadosComplementares = await this.pacienteRepository.buscarPorUsuarioId(id);
        } else if (usuario.tipo_usuario === 'profissional') {
            dadosComplementares = await this.profissionalRepository.buscarPorUsuarioComHistorico(id);
        }

        return {
            ...usuario.toJSON(),
            perfil: dadosComplementares
        };
    }
}