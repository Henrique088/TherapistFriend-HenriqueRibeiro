// src/interface/http/middlewares/verifySocketToken.ts

import { Socket, ExtendedError } from 'socket.io';
import cookie from 'cookie';
import { ITokenService } from '../../../domain/services/ITokenService';
import AppError from '../../../application/errors/AppError';


// Estende o tipo do Socket para o TypeScript reconhecer o usuário
export interface AuthenticatedSocket extends Socket {
    usuario?: {
        id: number;
        tipo: string;
    };
}

// O middleware agora recebe o TokenService (Abstração)
export const verifySocketToken = (tokenService: ITokenService) => {
    return (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => {
        try {
            const rawCookie = socket.handshake.headers.cookie;

            if (!rawCookie) {
                return next(new AppError('Cookie não fornecido'));
            }

            const cookies = cookie.parse(rawCookie);
            const token = cookies.accessToken; 

            if (!token) {
                return next(new AppError('Acesso negado: Token ausente'));
            }

            const decoded = tokenService.verificarToken(token, 'access') as any;

            // Injeta os dados no socket
            socket.data.usuario = {
                id: decoded.id,
                tipo: decoded.tipo
            };

           return next();
        } catch (error: any) {
            console.error('❌ Erro Auth Socket:', error.message);
            return next(new AppError('Token inválido ou expirado'));
        }
    };
};