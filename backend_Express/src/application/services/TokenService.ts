// src/application/services/TokenService.ts

// import * as jwt from "jsonwebtoken";
const jwt = require('jsonwebtoken');

import { ITokenService, TokenType } from "../../domain/services/ITokenService";
import AppError from "../errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_access_secret";

const REFRESH_SECRET = process.env.REFRESH_SECRET || "fallback_refresh_secret";

const SIGNALING_SECRET = process.env.SIGNALING_SECRET || "fallback_signaling_secret";

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_TTL || "2h";

const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_TTL || "7d";

const SIGNALING_TOKEN_EXPIRES = process.env.SIGNALING_TOKEN_TTL || "5m";

const ACCESS_TOKEN_LIFESPAN_MS = 2 * 60 * 60 * 1000;

const REFRESH_TOKEN_LIFESPAN_MS = 7 * 24 * 60 * 60 * 1000;

export class TokenService implements ITokenService {

    gerarAccessToken( payload: Record<string, any> ): string {

        return jwt.sign( payload,
            JWT_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRES
            }
        );

    }

    gerarRefreshToken( payload: Record<string, any> ): string {

        return jwt.sign( payload, REFRESH_SECRET,
            {
                expiresIn: REFRESH_TOKEN_EXPIRES
            }
        );

    }

    gerarSignalingToken( payload: Record<string, any> ): string {

        console.log( `🔑 Gerando Signaling Token para usuário ${payload.usuarioId}` );

        return jwt.sign( payload, SIGNALING_SECRET,
            {
                expiresIn: SIGNALING_TOKEN_EXPIRES
            }
        );

    }

    verificarToken<T = any>( token: string, tipo: TokenType = "access" ): T {

        try {

            let secret: string;

            switch (tipo) {

                case "access":
                    secret = JWT_SECRET;
                    break;

                case "refresh":
                    secret = REFRESH_SECRET;
                    break;

                case "signaling":
                    secret = SIGNALING_SECRET;
                    break;

                default:
                    throw new AppError( "Tipo de token inválido.", 400 );

            }

            console.log( `✅ Token ${tipo} validado` );

            return jwt.verify(token, secret) as T;

        } catch {

            throw new AppError( "Token inválido ou expirado.", 401 );

        }

    }

    extrairJti( token: string ): string {

        const decoded = jwt.decode(token) as { jti?: string; } | null;

        if (!decoded?.jti) {

            throw new AppError( "JTI não encontrado no token.", 400 );

        }

        return decoded.jti;

    }

    getAccessTokenLifespan(): number {
        return ACCESS_TOKEN_LIFESPAN_MS;
    }

    getRefreshTokenLifespan(): number {
        return REFRESH_TOKEN_LIFESPAN_MS;
    }

}