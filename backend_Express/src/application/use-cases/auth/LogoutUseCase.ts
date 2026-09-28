// src/application/use-cases/auth/LogoutUseCase.ts

import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { ITokenService } from '../../../domain/services/ITokenService';
import { StoredToken } from '../../dtos/AuthDTO';
import AppError from '../../errors/AppError';

export class LogoutUseCase {


    constructor(
        private refreshTokenRepository: IRefreshTokenRepository,
        private tokenService: ITokenService
    ) { }

    /**
     * Revoga o refresh token no banco de dados.
     * @param refreshToken O token JWT bruto (lido do cookie).
     */
    async execute(refreshToken: string | undefined): Promise<void> {

        // Se o cookie não estiver presente, apenas encerra a operação silenciosamente.
        if (!refreshToken) {
            return;
        }

        // Busca o registro do token no DB (decodificando o JTI a partir do token JWT bruto)
        const jti = this.tokenService.extrairJti(refreshToken);

        const storedToken: StoredToken | null = await this.refreshTokenRepository.buscarRefreshToken(jti);

        console.log("Token armazenado encontrado para logout:", storedToken);

        // Se o token nunca foi salvo ou já foi deletado (revogado), encerra.
        if (!storedToken) {
            return;
            // throw new AppError("Sessão inválida ou expirada.", 401);
            // Nota: Não lançar erro aqui para evitar vazamento de informações. 
        }

        // Revoga o token usando o JTI, que é a chave de busca no DB
        await this.refreshTokenRepository.invalidarRefreshToken(storedToken.jti);
    }
}