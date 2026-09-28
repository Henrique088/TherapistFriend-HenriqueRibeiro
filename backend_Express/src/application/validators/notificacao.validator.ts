// src/application/validator/notificacao.validator.ts

import * as Joi from 'joi';

export const NotificacaoValidator = {
    listar: Joi.object({
        page: Joi.number().integer().min(1).default(1)
            .messages({
                'number.base': 'Página deve ser um número inteiro.',
                'number.min': 'Página deve ser no mínimo 1.'
            }),
        limit: Joi.number().integer().min(1).max(100).default(10)
            .messages({
                'number.base': 'Limite deve ser um número inteiro.',
                'number.min': 'Limite deve ser no mínimo 1.',
                'number.max': 'Limite deve ser no máximo 100.'
            }),
        filtro: Joi.array().items(Joi.string()
            .valid('SOLICITACAO_VINCULO', 'SISTEMA', 'CHAT', 'AGENDA', 'SESSAO', 'RELATORIO','URGENCIA'))
            .single()
            .optional()
    }),

    marcarComoLida: Joi.object({
        notificacaoId: Joi.number().integer().positive().required()
            .messages({
                'any.required': 'O ID da notificação é obrigatório.',
                'number.base': 'ID da notificação deve ser um número inteiro.',
                'number.positive': 'ID da notificação deve ser positivo.'
            })
    }),

    paramsFiltro: Joi.object({
        filtro: Joi.array().items(Joi.string()
            .valid('SOLICITACAO_VINCULO', 'SISTEMA', 'CHAT', 'AGENDA', 'SESSAO', 'RELATORIO',))
            .single()
            .optional()
    })


}