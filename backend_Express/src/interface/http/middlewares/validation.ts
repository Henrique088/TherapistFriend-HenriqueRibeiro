// src/interface/http/middlewares/validation.ts

import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import AppError from '../../../application/errors/AppError';

// Defini quais partes do Request podem ser validadas
type ValidationSource = 'body' | 'params' | 'query';

export const validate = (schema: Schema, source: ValidationSource = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        
        
        const data = req[source];

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true 
        });

        if (error) {
            const errorMessages = error.details.map(d => d.message);
            throw new AppError(errorMessages, 400);
        }

        // garante a substituição, o express por segurança bloqueia trocar por um objeto totalmente novo. O Object.assing, contorna modificando os valores sem perder a referência
        if (source === 'query' || source === 'params') {
            for (const key in req[source]) {
                delete (req[source] as any)[key];
            }
            Object.assign(req[source], value);
        } else {
            // Para o 'body', geralmente a sobrescrita direta funciona, 
            // mas Object.assign é mais seguro para todos:
            req.body = value;
        }
        
        next();
    };
};