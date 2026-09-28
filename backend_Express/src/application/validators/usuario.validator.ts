// src/application/validators/usuario.validator.ts

import * as Joi from 'joi';
import { UsuarioRegistroDTO, AtualizarUsuarioDTO, BuscarPorEmailUsuarioDTO, BuscarPorIdUsuarioDTO } from '../dtos/UsuarioDTO';

export const UsuarioValidator = {
    criar: Joi.object<UsuarioRegistroDTO>({
    nome: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'O nome deve ser um texto.',
      'string.empty': 'O nome é obrigatório.',
      'string.min': 'O nome deve ter pelo menos {#limit} caracteres.',
      'string.max': 'O nome não pode ter mais de {#limit} caracteres.',
      'any.required': 'O nome é um campo obrigatório.'
    }),
    email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'O e-mail deve ser um texto.',
      'string.empty': 'O e-mail é obrigatório.',
      'string.email': 'Por favor, insira um e-mail válido.',
      'any.required': 'O e-mail é um campo obrigatório.'
    }),
    telefone: Joi.string()
    .trim()
    .length(11)
    .required()
    .messages({
      'string.base': 'O telefone deve ser um texto.',
      'string.empty': 'O telefone é obrigatório.',
      'string.length': 'O telefone deve conter exatamente {#limit} dígitos (DDD + número).',
      'any.required': 'O telefone é um campo obrigatório.'
    }),
    senha: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'A senha deve ser um texto.',
      'string.empty': 'A senha é obrigatória.',
      'string.min': 'A senha deve ter pelo menos {#limit} caracteres.',
      'any.required': 'A senha é um campo obrigatório.'
    }),
    tipo_usuario: Joi.string()
    .valid('paciente', 'profissional')
    .default('paciente')
    .messages({
      'string.base': 'O tipo de usuário deve ser um texto.',
      'any.only': 'O tipo de usuário deve ser paciente, profissional.'
    })

    }),

    atualizar: Joi.object<AtualizarUsuarioDTO>({
    nome: Joi.string().min(2).max(100),
    telefone: Joi.string().trim().length(11),
    ativo: Joi.boolean()
}).min(1), // Exige pelo menos um campo para atualizar

    validadeIdParams: Joi.object<AtualizarUsuarioDTO>({
        id: Joi.number().integer().required(),
    }),

    buscarPorEmail: Joi.object<BuscarPorEmailUsuarioDTO>({
        email: Joi.string().email().required(),
    }),

    buscarPorId: Joi.object<BuscarPorIdUsuarioDTO>({
        id: Joi.number().integer().required(),

    }),
    
    
    

    validarCodigo: Joi.object<{ usuarioId: number; codigo: string }>({
        
        codigo: Joi.string().length(6).required(),
    }),

}
