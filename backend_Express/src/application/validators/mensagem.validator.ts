// src/application/validators/mensagem.validator.ts

import * as Joi from 'joi'; 


export const MensagemValidator = {
    enviar: Joi.object({
        // remetenteId: Joi.number().integer().required(),
        texto: Joi.string().min(1).max(1000).required()
    }),

    editar: Joi.object({
        novoTexto: Joi.string().min(1).max(1000).required(),
        // usuarioId: Joi.number().integer().required()
    }),

    // visualizar: Joi.object({
    //     usuarioId: Joi.number().integer().required()
    // }),

    // deletar: Joi.object({
    //     usuarioId: Joi.number().integer().required()
    // }),

    conversaIdParam: Joi.object({
        conversaId: Joi.number().integer().required()
    }),

    mensagemIdParam: Joi.object({
        mensagemId: Joi.number().integer().required()
    }),

    listar: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
        }),
}