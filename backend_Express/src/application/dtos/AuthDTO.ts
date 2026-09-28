// src/application/dtos/AuthDTO.ts

import { IUsuarioData } from "../../domain/entities/UsuarioEntity";
import * as jwt from 'jsonwebtoken';


export interface LoginDTO {
    email: string;
    senha: string;
}

export interface LoginResponseDTO {
    usuario: IUsuarioData;
    accessToken: string;
    refreshToken: string;
    accessMaxAge: number;
    refreshMaxAge: number;
}

export interface StoredToken {
    id: number;
    user_id: number;
    token_hash: string;
    jti: string; // Chave de revogação
    expires_at: Date;
}


export interface RefreshResponseDTO {
    accessToken: string;
    refreshToken: string;
    usuario: IUsuarioData;
    refreshMaxAge: number;
    accessMaxAge: number;
}


export interface StoredRefreshToken {
    id: number; // PK do DB
    jti: string; // ID do Token JWT
}



export interface RefreshPayload extends jwt.JwtPayload {
    id: number;
    tipo: string;
    jti: string;
}

