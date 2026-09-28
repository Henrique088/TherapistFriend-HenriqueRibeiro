// src/domain/services/ISignalingTokenService.ts

export interface SignalingTokenPayload {

    sessaoId: string;

    usuarioId: number;

    tipoUsuario?: string;

}

export interface ISignalingTokenService {

    generate( sessaoId: string, usuarioId: number, tipoUsuario?: string ): Promise<string>;

    verify( token: string ): Promise<SignalingTokenPayload>;

}