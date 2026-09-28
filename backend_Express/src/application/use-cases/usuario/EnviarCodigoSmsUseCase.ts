// src/application/use-cases/usuario/EnviarCodigoSmsUseCase.ts

import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IQueueService } from '../../services/IQueueService'; 
import AppError from '../../errors/AppError';
import { BuscarPorEmailUsuarioDTO } from '../../dtos/UsuarioDTO';

export class EnviarCodigoSmsUseCase {
    constructor(
        private validacaoRepository: IValidacaoRepository,
        private usuarioRepository: IUsuarioRepository,
        private queueService: IQueueService 
    ) { }

    async execute({ email }: BuscarPorEmailUsuarioDTO) {
        // Busca os dados do usuário
        const usuario = await this.usuarioRepository.buscarPorEmail(email);
        
        if (!usuario) throw new AppError('Usuário não encontrado', 404);
        if (usuario.telefone_validado) throw new AppError('Telefone já verificado.', 400);
        if (!usuario.telefone) throw new AppError('Telefone não cadastrado para este usuário', 400);

        // Gera o código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        if (!usuario.id) throw new AppError('Usuário não encontrado', 404);

        // Persiste o código na tabela de apoio (validade de 15 min)
        await this.validacaoRepository.salvarCodigo(usuario.id, codigo, 'SMS', 15);

        const to = `+55${usuario.telefone.replace(/\D/g, '')}`;

        // Envia para a fila do Worker processar em background
        try {
            await this.queueService.addJob(
                'sms-queue',               // Nome da fila definido no Worker
                'enviar_sms_verificacao',  // Nome da ação (job)
                { 
                    to: to, 
                    message: `Seu código TherapistFriend: ${codigo}` 
                }
            );
        } catch (error) {
            console.error(`[QueueError] Falha ao enfileirar SMS para o usuário ${usuario.id}:`, error);
        }
    }
}