// src/application/validator/agenda.validator.ts

import * as Joi from 'joi';

export const AgendaValidator = {
    // Validação para salvar a grade de disponibilidade (PUT /grade)
    salvarGrade: Joi.object({
        grades: Joi.array().items(
            Joi.object({
                diaSemana: Joi.number().integer().min(0).max(6).required()
                    .messages({ 'number.min': 'Dia da semana deve ser entre 0 (Dom) e 6 (Sáb).' }),
                horaInicio: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).required()
                    .messages({ 'string.pattern.base': 'Hora de início deve estar no formato HH:mm.' }),
                horaFim: Joi.string().pattern(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).required()
                    .messages({ 'string.pattern.base': 'Hora de término deve estar no formato HH:mm.' })
            })
        ).min(1).required().messages({ 'array.min': 'É necessário informar ao menos um horário na grade.' })
    }),

    // Validação para buscar horários livres (GET /livres)
    listarDisponibilidade: Joi.object({
        data: Joi.date().iso().required()
            .messages({ 'date.format': 'A data deve estar no formato ISO (AAAA-MM-DD).' }),
        duracao: Joi.number().integer().min(15).max(120).default(30)
            .messages({ 'number.min': 'A duração mínima da consulta é 15 minutos.' })
    }),

    // Validação para buscar eventos do calendário (GET /eventos)
    listarEventos: Joi.object({
        inicio: Joi.date().iso().required(),
        fim: Joi.date().iso().required()
    }).messages({ 'any.required': 'As datas de início e fim são obrigatórias para filtrar o calendário.' }),

    // Validação para criar um novo agendamento (POST /agendar)

    agendar: Joi.object({
        pacienteId: Joi.number().integer().positive().required(),
        profissionalId: Joi.number().integer().positive().required(),

        // .iso() garante o formato, mas precisamos garantir que o Joi não 
        // "mexa" nas horas ao transformar em objeto Date.
        dataInicio: Joi.date().iso().required()
            .messages({
                'date.base': 'Data de início inválida.',
                'date.format': 'Use o formato ISO (Ex: 2026-03-09T08:00:00Z)'
            }),

        dataFim: Joi.date().iso().greater(Joi.ref('dataInicio')).required()
            .messages({
                'date.greater': 'A data de término deve ser posterior à data de início.'
            }),

        tipo: Joi.string().valid('regular', 'urgencia').default('regular'),
        observacoes: Joi.string().max(500).allow('', null)
    }),

    // Validação para confirmar/recusar (PATCH /responder)
    responder: Joi.object({
        acao: Joi.string().valid('confirmado', 'cancelado').required()
            .messages({ 'any.only': 'A ação deve ser "confirmado" ou "cancelado".' })
    }),

    // Validação para IDs nos parâmetros da URL (id, profissionalId)
    paramsId: Joi.object({
        id: Joi.number().integer().positive().required(),
        // profissionalId: Joi.number().integer().positive()
    }),

    paramsProfissionaId: Joi.object({
        profissionalId: Joi.number().integer().positive().required()
    }),
    salvarExcecao: Joi.object({
        profissionalId: Joi.number().integer().positive().required(),

        // O ID do bloqueio pai é essencial para vincular a exceção
        bloqueioId: Joi.number().integer().positive().required()
            .messages({ 'any.required': 'O ID do bloqueio é obrigatório.' }),

        dataExcecao: Joi.date().iso().required()
            .messages({ 'date.format': 'A data da exceção deve estar no formato ISO.' }),

        motivo: Joi.string().max(255).allow('', null)
            .messages({ 'string.max': 'O motivo deve ter no máximo 255 caracteres.' }),


    }),
    // Validação para bloqueios recorrentes (ex: Bloquear todas as Segundas das 08:00 às 09:00)
    salvarBloqueio: Joi.object({
        profissionalId: Joi.number().integer().positive().required(),
        titulo: Joi.string().max(100).required(),
        dataInicio: Joi.date().iso().required()
            .messages({ 'date.format': 'A data de início deve estar no formato ISO.' }),
        dataFim: Joi.date().iso().greater(Joi.ref('dataInicio')).required()
            .messages({ 'date.greater': 'A data de término deve ser posterior à data de início.' }),
        recorrente: Joi.boolean().default(false),
        tipo: Joi.string().valid('comum', 'estrategico', 'pessoal', 'feriado').default('comum'),

        diasSemana: Joi.array()
            .items(Joi.number().min(0).max(6))
            .unique()
            .when('recorrente', {
                is: true,
                then: Joi.array().min(1).required(),
                otherwise: Joi.optional().allow(null)
            })
            .messages({
                'array.min': 'Selecione ao menos um dia da semana para bloqueios recorrentes.',
                'any.required': 'Os dias da semana são obrigatórios para bloqueios recorrentes.'
            })
    }),

    // Para listar exceções/bloqueios de um profissional específico
    listarConfiguracoes: Joi.object({
        profissionalId: Joi.number().integer().positive().required()
    }),

    solicitarUrgencia: Joi.object({
        pacienteId: Joi.number().integer().positive().required(),
        motivo: Joi.string().max(250).optional(),
        janela_de_tempo: Joi.string().valid('3_dias', '7_dias').default('3_dias')
    }),

    removerBloqueio: Joi.object({
        profissionalId: Joi.number().integer().positive().required(),
        bloqueioId: Joi.number().integer().positive().required()
    }),

    removerExcecao: Joi.object({
        profissionalId: Joi.number().integer().positive().required(),
        bloqueioId: Joi.number().integer().positive().required(),
    }),

    removerExcecaoParams: Joi.object({
        excecaoId: Joi.number().integer().positive().required(),
    }),


};