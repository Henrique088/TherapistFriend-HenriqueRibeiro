// src/application/use-cases/usuario/ValidarCodigoEmailUseCase.ts

import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import AppError from '../../errors/AppError';
import { ValidarCodigoDTO } from '../../dtos/UsuarioDTO';


export class ValidarCodigoEmailUseCase {
    constructor(
        private validacaoRepository: IValidacaoRepository,
        private usuarioRepository: IUsuarioRepository
    ) {}

    async execute({ email, codigo }: ValidarCodigoDTO): Promise<void> {

        const usuario = await this.usuarioRepository.buscarPorEmail(email);

        if (!usuario) throw new AppError('Email não cadastrado para validar', 400);

        if(!usuario.id) throw new AppError('Email não cadastrado para validar', 400);
        // Verifica se o código é válido para o tipo EMAIL
        const eValido = await this.validacaoRepository.buscarCodigoValido(
            usuario.id, 
            codigo, 
            'EMAIL'
        );

        if (!eValido) {
            throw new AppError('Código de e-mail inválido ou expirado.', 400);
        }

        // Atualiza o status de identidade
        usuario.emailValidado();
        
        await this.usuarioRepository.salvar(usuario);

        // Limpa os códigos de e-mail pendentes para este usuário
        await this.validacaoRepository.invalidarCodigos(usuario.id, 'EMAIL');

        console.log(`[ValidarCodigoEmail] E-mail do usuário ${usuario.id} verificado com sucesso.`);
    }
}