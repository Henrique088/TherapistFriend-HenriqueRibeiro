// src/application/use-cases/auth/RefreshTokenUseCase.ts

import { v4 as uuidv4 } from 'uuid';
import AppError from '../../errors/AppError';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { ITokenService } from '../../../domain/services/ITokenService';
import { ICriptografiaService } from '../../../domain/services/ICriptografiaService';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { RefreshResponseDTO, StoredRefreshToken, RefreshPayload } from '../../dtos/AuthDTO';


export class RefreshTokenUseCase {

    constructor(
       private refreshTokenRepository: IRefreshTokenRepository,
       private usuarioRepository: IUsuarioRepository,
       private tokenService: ITokenService,
       private criptografiaService: ICriptografiaService
    ) { }

    async execute(oldRefreshToken: string | undefined | null): Promise<RefreshResponseDTO> {
        
        // Se não enviaram o token
        if (!oldRefreshToken) {
            throw new AppError("Refresh token não enviado", 401);
        }

        // Decodificar / validar o token
        let payload: RefreshPayload | null;
        try {

            payload = this.tokenService.verificarToken(oldRefreshToken, 'refresh') as RefreshPayload;
        } catch (error) {
            // Captura o AppError lançado pelo TokenService (ex: "Token inválido ou expirado")
            throw new AppError("Refresh token inválido", 401); 
        }
        
        // Validação do Payload
        if (!payload || !payload.id || !payload.jti) {
            throw new AppError("Refresh token inválido", 401);
        }

        // Garantir que o token ainda está registrado (no DB)
        const existingToken: StoredRefreshToken | null = 
             await this.refreshTokenRepository.buscarRefreshToken(payload.jti as string);

        if (!existingToken) {
            // CRÍTICO: Token expirado/revogado. Sessão comprometida ou já encerrada.
            throw new AppError("Refresh token expirado ou inválido (sessão não encontrada no DB).", 401);
        }
        
        // BUSCAR A ENTIDADE E APLICAR REGRAS DE NEGÓCIO
        const usuarioEntity: UsuarioEntity | null = await this.usuarioRepository.buscarPorId(payload.id);

        if (!usuarioEntity) {
            throw new AppError("Sessão inválida. Usuário não encontrado.", 401);
        }

        // Regra de Negócio Crítica: Checa se a conta ainda está ativa
        if (!usuarioEntity.ativo) {
            throw new AppError("Sessão revogada. Conta inativa.", 403);
        }
        
        // Revogar token antigo (Rotation)
        await this.refreshTokenRepository.invalidarRefreshToken(existingToken.jti);


        // Cria novo Payload
        const novoPayload = {
            id: usuarioEntity.id,
            tipo_usuario: usuarioEntity.tipo_usuario, 
            jti: uuidv4()
        };

        // Gera novos tokens
        const newAccess = this.tokenService.gerarAccessToken(novoPayload);
        const newRefresh = this.tokenService.gerarRefreshToken(novoPayload);

        // Registra novo refresh
        const newRefreshTokenHash = await this.criptografiaService.hash(newRefresh);
        const refreshMaxAge = this.tokenService.getRefreshTokenLifespan();
        const expiresAt = new Date(Date.now() + refreshMaxAge);
        const accessMaxAge = this.tokenService.getAccessTokenLifespan();

        await this.refreshTokenRepository.salvarRefreshToken({
            user_id: usuarioEntity.id as number,
            token_hash: newRefreshTokenHash,
            expires_at: expiresAt,
            jti: novoPayload.jti
        });

        // Retorno DTO
        return {
            accessToken: newAccess,
            refreshToken: newRefresh,
            usuario: usuarioEntity.toJSON(),
            refreshMaxAge,
            accessMaxAge
        };
    }
}