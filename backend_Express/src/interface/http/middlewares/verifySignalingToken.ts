// src/interface/http/middleware/verifySignalingToken.ts

import { Socket, ExtendedError } from "socket.io";


import { ITokenService, SignalingTokenPayload } from "../../../domain/services/ITokenService";
import AppError from "../../../application/errors/AppError";

// Estende o socket para armazenar os dados da sessão
export interface SignalingSocket extends Socket { signaling?: SignalingTokenPayload; }

export const verifySignalingToken =
    (tokenService: ITokenService) => {

        return (
            socket: SignalingSocket,
            next: (err?: ExtendedError) => void
        ) => {

            try {

                const token = socket.handshake.auth?.token;

                if (!token) {

                    return next( new AppError("Token de sinalização não informado") );

                }

                const payload = tokenService.verificarToken<SignalingTokenPayload>(
                        token,
                        "signaling"
                    );

                socket.signaling = payload;

                console.log( 
                    `🔐 Signaling autenticado | usuário=${payload.usuarioId} sessão=${payload.sessaoId}`
                );

                return next();

            } catch (error: any) {

                console.error( "❌ Erro Signaling Auth:", error.message );

                return next( new AppError("Token de sinalização inválido ou expirado") );

            }

        };

    };