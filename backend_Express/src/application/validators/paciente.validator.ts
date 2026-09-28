// src/application/validators/paciente.validator.ts

import * as Joi from 'joi'; 

export const atualizarPacienteSchema = Joi.object({
    // O ID do Paciente logado é necessário para buscar a entidade
    // id: Joi.number().integer().positive().required()
    //     .messages({
    //         'any.required': 'O ID do Paciente logado é obrigatório.',
    //         'number.base': 'ID do Paciente deve ser um número inteiro.',
    //         'number.positive': 'ID do Paciente deve ser positivo.'
    //     }),

    idUsuario: Joi.number().integer().positive().required()
        .messages({
            'any.required': 'O ID do Usuário logado é obrigatório.',
            'number.base': 'ID do Usuário deve ser um número inteiro.',
            'number.positive': 'ID do Usuário deve ser positivo.'
        }),

    codinome: Joi.string().trim().min(3).max(50).optional()
        .messages({
            'string.empty': 'Codinome não pode ser vazio.',
            'string.base': 'Codinome deve ser uma string.',
            'string.min': 'Codinome deve ter pelo menos 3 caracteres.',
            'string.max': 'Codinome deve ter no máximo 50 caracteres.'
        }),

}).min(2); // Garante que pelo menos o idPaciente e mais um campo sejam enviados.

