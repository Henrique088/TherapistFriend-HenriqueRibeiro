// src/application/validators/auth.validator.ts

import * as Joi from 'joi';

// --- DEFINIÇÕES DE DTOs PARA TIPAGEM ---

/**
 *  DTO de entrada para o LoginUseCase
 */
export interface LoginDTO {
    email: string;
    senha: string;
}

/**
 * DTO de entrada para o CriarUsuarioUseCase (Registro)
 * Nota: Este DTO é usado no seu módulo Usuário, mas a validação reside aqui.
 */
type TipoUsuario = 'paciente' | 'profissional' | 'admin';

export interface RegistrarUsuarioDTO {
    nome: string;
    email: string;
    senha: string;
    tipo_usuario: TipoUsuario;
}


// --- SCHEMAS DE VALIDAÇÃO (JOI) ---

export const loginSchema = Joi.object<LoginDTO>({ // Tipagem no Joi
    email: Joi.string()
        .email({ 
            tlds: { allow: false } 
        })
        .required()
        .messages({
            'string.empty': 'Por favor, digite seu e-mail',
            'string.email': 'Digite um e-mail válido (ex: nome@exemplo.com)',
            'any.required': 'O e-mail é obrigatório para login'
        }),
        
    senha: Joi.string()
        .required()
        .messages({
            'string.empty': 'Por favor, digite sua senha',
            'any.required': 'A senha é obrigatória para login'
        })
});


export const registrarUsuarioSchema = Joi.object<RegistrarUsuarioDTO>({ // Tipagem no Joi
    nome: Joi.string().trim().min(2).max(100).required()
        .messages({
            'any.required': 'O nome é obrigatório.',
            'string.min': 'Nome deve ter pelo menos 2 caracteres.'
        }),
        
    email: Joi.string().email().required()
        .messages({
            'any.required': 'O e-mail é obrigatório.',
            'string.email': 'E-mail inválido.'
        }),
        
    senha: Joi.string().min(6).required()
        .messages({
            'any.required': 'A senha é obrigatória.',
            'string.min': 'Senha deve ter pelo menos 6 caracteres.'
        }),
        
    tipo_usuario: Joi.string().valid('paciente', 'profissional', 'admin') // 1. Defina as regras
        .required()
        // 2. Aplique as mensagens
        .messages({ 
            'any.required': 'O tipo de usuário é obrigatório.',
            'any.only': 'Tipo de usuário inválido.'
        }) as Joi.Schema<TipoUsuario> // 3. Aplique o cast NO FINAL, ou nem use.

});