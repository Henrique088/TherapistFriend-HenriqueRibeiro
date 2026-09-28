// src/application/validators/profissional.validator.ts

import Joi from 'joi';

export const completarPerfilProfissionalSchema = Joi.object({
    id_usuario: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'ID do usuário deve ser um número inteiro.',
            'number.integer': 'ID do usuário deve ser um número inteiro.',
            'number.positive': 'ID do usuário deve ser positivo.',
            'any.required': 'ID do usuário é obrigatório.'
        }),
    cpf: Joi.string().trim().length(11).required()
        .messages({
            'string.empty': 'CPF não pode ser vazio.',
            'string.base': 'CPF deve ser uma string.',
            'string.length': 'CPF deve conter 11 dígitos.',
            'any.required': 'CPF é obrigatório.'
        }),
    crp: Joi.string().trim().min(5).max(20).required()
        .messages({
            'string.empty': 'CRP não pode ser vazio.',
            'string.base': 'CRP deve ser uma string.',
            'string.min': 'CRP deve ter pelo menos 5 caracteres.',
            'string.max': 'CRP deve ter no máximo 20 caracteres.',
            'any.required': 'CRP é obrigatório.'
        }),
    bio: Joi.string().trim().max(500).optional()
        .messages({
            'string.base': 'Bio deve ser uma string.',
            'string.max': 'Bio deve ter no máximo 500 caracteres.'
        }),
    especialidadesIds: Joi.array().items(
        Joi.number().integer().positive().required()
            .messages({
                'number.base': 'ID da especialidade deve ser um número inteiro.',
                'number.integer': 'ID da especialidade deve ser um número inteiro.',
                'number.positive': 'ID da especialidade deve ser positivo.',
                'any.required': 'ID da especialidade é obrigatório.'
            })
    ).min(1).required()
        .messages({
            'array.base': 'Especialidades deve ser um array de IDs.',
            'array.min': 'Deve haver pelo menos uma especialidade selecionada.',
            'any.required': 'Especialidades são obrigatórias.'
        })
});

export const registrarProfissionalSchema = Joi.object({
    nome: Joi.string().trim().min(3).max(100).required()
        .messages({
            'string.empty': 'Nome não pode ser vazio.',
            'string.base': 'Nome deve ser uma string.',
            'string.min': 'Nome deve ter pelo menos 3 caracteres.',
            'string.max': 'Nome deve ter no máximo 100 caracteres.',
            'any.required': 'Nome é obrigatório.'
        }),
    email: Joi.string().trim().email().required()
        .messages({
            'string.empty': 'Email não pode ser vazio.',
            'string.email': 'Email deve ser um endereço de email válido.',
            'any.required': 'Email é obrigatório.'
        }),
    senha_plana: Joi.string().min(6).required()
        .messages({
            'string.empty': 'Senha não pode ser vazia.',
            'string.base': 'Senha deve ser uma string.',
            'string.min': 'Senha deve ter pelo menos 6 caracteres.',
            'any.required': 'Senha é obrigatória.'
        }),

    cpf: Joi.string().trim().length(11).optional()
        .messages({
            'string.empty': 'CPF não pode ser vazio.',
            'string.base': 'CPF deve ser uma string.',
            'string.length': 'CPF deve conter 11 dígitos.',
            'any.required': 'CPF é obrigatório.'
        }),
    crp: Joi.string().trim().min(5).max(20).optional()
        .messages({
            'string.empty': 'CRP não pode ser vazio.',
            'string.base': 'CRP deve ser uma string.',
            'string.min': 'CRP deve ter pelo menos 5 caracteres.',
            'string.max': 'CRP deve ter no máximo 20 caracteres.',
            'any.required': 'CRP é obrigatório.'
        }),
    bio: Joi.string().trim().max(500).optional()
        .messages({
            'string.base': 'Bio deve ser uma string.',
            'string.max': 'Bio deve ter no máximo 500 caracteres.'
        }),
    especialidades_ids: Joi.array().items(
        Joi.number().integer().positive().optional()
            .messages({
                'number.base': 'ID da especialidade deve ser um número inteiro.',
                'number.integer': 'ID da especialidade deve ser um número inteiro.',
                'number.positive': 'ID da especialidade deve ser positivo.',
                'any.required': 'ID da especialidade é obrigatório.'
            })
    ).min(3).required()
        .messages({
            'array.base': 'Especialidades deve ser um array de IDs.',
            'array.min': 'Deve haver pelo menos uma especialidade selecionada.',
            'any.required': 'Especialidades são obrigatórias.'
        })
});
// Esquema de validação para registro de profissional


export const buscarProfissionaisSchema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        nome: Joi.string().trim().optional(),
        especialidades: Joi.string().trim().optional(),
});



