// src/application/use-cases/usuario/ValidarCodigoSmsUseCase.ts

import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import AppError from '../../errors/AppError';
import { ValidarCodigoDTO } from '../../dtos/UsuarioDTO';

export class ValidarCodigoSmsUseCase {
    constructor(
        private validacaoRepository: IValidacaoRepository,
        private usuarioRepository: IUsuarioRepository
    ) {}

    async execute({ email, codigo }: ValidarCodigoDTO): Promise<void> {

        const usuario = await this.usuarioRepository.buscarPorEmail(email);

        if (!usuario) throw new AppError('Usuário não encontrado.', 404);
        if (!usuario.id) throw new AppError('Usuário não encontrado.', 404);


        // Verifica se existe um código válido (não expirado) no banco
        const eValido = await this.validacaoRepository.buscarCodigoValido(
            usuario.id, 
            codigo, 
            'SMS'
        );

        if (!eValido) {
            throw new AppError('Código inválido ou expirado.', 400);
        }

        // Atualiza o status do usuário para verificado

        usuario.telefoneValidado();
        
        await this.usuarioRepository.salvar(usuario);

        // Limpa a tabela de códigos (Segurança: código só pode ser usado uma vez)
        await this.validacaoRepository.invalidarCodigos(usuario.id, 'SMS');
    }
}