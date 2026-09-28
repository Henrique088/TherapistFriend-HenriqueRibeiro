import { Request } from 'express';

// Definindo a estrutura do objeto 'usuario' que será injetado
interface UsuarioJWT {
    id: number;
    tipo: 'paciente' | 'profissional' | 'admin';
}

// Estendendo o tipo Request do Express para incluir o campo injetado
declare global {
    namespace Express {
        interface Request {
            usuario: UsuarioJWT; // O '?' é opcional dependendo de onde o middleware é usado
        }
    }
}