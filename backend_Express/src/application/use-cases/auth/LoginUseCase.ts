// src/application/use-cases/auth/LoginUseCase.ts

import { v4 as uuidv4 } from 'uuid'; 
import AppError from '../../errors/AppError';

// --- Dependências Tipadas (Contratos) ---
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { ICriptografiaService } from '../../../domain/services/ICriptografiaService'; 
import { ITokenService } from '../../../domain/services/ITokenService'; 
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { LoginDTO, LoginResponseDTO } from '../../dtos/AuthDTO';



export class LoginUseCase {

    constructor(
      private  usuarioRepository: IUsuarioRepository,
      private  criptografiaService: ICriptografiaService,
      private  tokenService: ITokenService,
      private  refreshTokenRepository: IRefreshTokenRepository
    ) { }

    /**
     * Autentica o usuário, verifica a senha e gera tokens de acesso e refresh.
     */
    async execute({ email, senha }: LoginDTO): Promise<LoginResponseDTO> { 

    
        
        // O buscarPorEmail retorna UsuarioEntity | null
        const usuarioEntity: UsuarioEntity | null = await this.usuarioRepository.buscarPorEmail(email);
        
        // Verifica credenciais
        if (!usuarioEntity) {
            throw new AppError("Credenciais inválidas", 400); 
        }

        // Verifica a senha usando o hash da Entidade
        const senhaCorreta: boolean = await this.criptografiaService.comparar(senha, usuarioEntity.senha_hash || '');
        if (!senhaCorreta) {
            throw new AppError("Credenciais inválidas", 400);
        }
        
        //  REGRAS DE NEGÓCIO: Checa se a conta está ativa
        usuarioEntity.isAtivo();
        

        // Criação do Payload do Token
        const jti: string = uuidv4();
        
        const payload = {
            id: usuarioEntity.id, 
            tipo_usuario: usuarioEntity.tipo_usuario,
            jti: jti
        };

        // Geração e Persistência de Tokens
        const accessToken: string = this.tokenService.gerarAccessToken(payload);
        const refreshToken: string = this.tokenService.gerarRefreshToken(payload);

        const accessMaxAge: number = this.tokenService.getAccessTokenLifespan();
        const refreshMaxAge: number = this.tokenService.getRefreshTokenLifespan();

        
        const tokenHash: string = await this.criptografiaService.hash(refreshToken); 
        const expiresAt: Date = new Date(Date.now() + refreshMaxAge);

        // Salvar refresh token no banco
        await this.refreshTokenRepository.salvarRefreshToken({
            user_id: payload.id as number, 
            token_hash: tokenHash, 
            expires_at: expiresAt,
            jti: jti
        });

        return {
            usuario: usuarioEntity.toJSON(), 
            accessToken,
            refreshToken,
            accessMaxAge,
            refreshMaxAge
        };
    }
}