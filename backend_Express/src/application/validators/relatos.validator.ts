// src/application/validators/RelatoValidator.ts

import Joi from 'joi';

export const RelatoValidator = {
    // Schema para criação
    criar: Joi.object({
        titulo: Joi.string()
        .min(5)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.base': 'O título deve ser um texto',
            'string.empty': 'O título não pode estar vazio',
            'string.min': 'O título deve ter no mínimo 5 caracteres',
            'string.max': 'O título deve ter no máximo 100 caracteres',
            'any.required': 'O título é obrigatório'
        }),
        texto: Joi.string()
        .min(20)
        .required()
        .messages({
            'string.base': 'O texto deve ser um texto válido',
            'string.empty': 'O texto não pode estar vazio',
            'string.min': 'O texto deve conter no mínimo 20 caracteres',
            'any.required': 'O texto é obrigatório'
        }),
        categoria: Joi.string()
        .required()
        .messages({
            'any.required': 'A categoria é obrigatória'
        }),
        anonimo: Joi.boolean().default(false)
        .messages({
                'string.min': 'O texto do relato deve conter no mínimo 20 letras',
            })
    }),

  
    decidirVinculo: Joi.object({
        profissionalId: Joi.number().integer().required().messages({
            'number.base': 'O ID do profissional deve ser um número válido'
        }),
        decisao: Joi.string().valid('aceitar', 'recusar').required().messages({
            'any.only': 'A decisão deve ser "aceitar" ou "recusar"'
        })
    }),

    validarId: Joi.object({
        id: Joi.number().integer().required()
    }),

     validarRelatoId: Joi.object({
        relatoId: Joi.number().integer().required()
    }),

    



    // Schema para paginação
    listar: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        gravidade: Joi.array()
            .items(Joi.string().valid('leve', 'media', 'grave', 'indeterminado'))
            .single() 
            .optional(),

        busca: Joi.string().trim().min(2).max(50).optional()
    }),

    assumir: Joi.object({
        relatoId: Joi.number().integer().required()
    }),

    recusar: Joi.object({
        profissionalId: Joi.number().integer().required().messages({
            'number.base': 'O ID do profissional deve ser um número válido'
        }),
        relatoId: Joi.number().integer().required()
    })
};