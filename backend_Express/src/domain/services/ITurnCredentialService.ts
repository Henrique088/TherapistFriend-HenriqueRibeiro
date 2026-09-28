// src/domain/services/ITurnCredentialService.ts

export interface IceServer {
    urls: string;
    username?: string;
    credential?: string;
}

export interface ITurnCredentialService {

    /**
     * Gera (ou reutiliza) as credenciais TURN de um usuário
     * para uma determinada sessão.
     */
    generateIceServers( sessaoId: string, userId: number ): Promise<IceServer[]>;

    // /**
    //  * Remove a credencial de um usuário.
    //  * Utilizado quando ele sai da chamada.
    //  */
    // revokeCredential(
    //     sessaoId: string,
    //     userId: number
    // ): Promise<void>;

    // /**
    //  * Remove todas as credenciais emitidas para uma sessão.
    //  * Utilizado ao finalizar definitivamente a sessão.
    //  */
    // revokeSessionCredentials(
    //     sessaoId: string
    // ): Promise<void>;
}