// src/application/validator/sessao.validator.ts

import * as Joi from 'joi';

export const SessaoValidator = {
    sessaoId: Joi.object({
        id: Joi.string().uuid().required().messages({
            'string.base': 'sessaoId deve ser uma string',
            'string.empty': 'sessaoId não pode estar vazio',
            'string.uuid': 'sessaoId deve ser um UUID válido',
            'any.required': 'sessaoId é obrigatório'
        })
    })
};
