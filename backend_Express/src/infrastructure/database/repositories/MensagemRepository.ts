// src/infrastructure/database/repositories/MensagemRepository.ts

import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { MensagemEntity } from '../../../domain/entities/MensagemEntity';
import { MensagemModel } from '../models/mensagem.model';
import { EncryptionService } from '../../../application/services/EncryptionService';
import { Op } from 'sequelize';
import { ConversaModel } from '../models/conversa.model';

export class MensagemRepository implements IMensagemRepository {
    private encryptionService: EncryptionService;

    constructor(
        private ModelMensagem: typeof MensagemModel,
        private ModelConversa: typeof ConversaModel) {
        this.encryptionService = new EncryptionService();
    }

    async salvar(mensagem: MensagemEntity): Promise<MensagemEntity> {
        // 1. Criptografar o conteúdo antes de salvar no Model
        const { conteudo, iv } = this.encryptionService.criptografar(mensagem.texto);

        // 2. Persistir no banco usando o Model
        const msgCriada = await this.ModelMensagem.create({
            conversa_id: mensagem.conversaId,
            remetente_id: mensagem.remetenteId,
            conteudo: conteudo, // HEX criptografado
            iv: iv,             // IV em HEX
            lida: mensagem.lida
        });

        // 3. Retornar a Entidade (com o ID gerado pelo banco e texto original)
        return new MensagemEntity({
            id: Number(msgCriada.id),
            conversaId: msgCriada.conversa_id,
            remetenteId: msgCriada.remetente_id,
            conteudo: mensagem.texto, // Mantém o texto puro para o domínio
            lida: msgCriada.lida,
            data_envio: msgCriada.data_envio
        });
    }

    async buscarPorConversa(conversaId: number, limit = 50, cursor?: Date): Promise<MensagemEntity[]> {
        const where: any = {conversa_id: conversaId}

        if(cursor) {
            where.dat_envio = {
                [Op.lt]: cursor
            };
        }
        
        const mensagens = await this.ModelMensagem.findAll({
            where: { conversa_id: conversaId },
            limit,
            order: [['data_envio', 'DESC']]
        });

        // Mapear modelos para entidades, descriptografando o conteúdo
        const format = mensagens.map(m => {
            const textoPuro = this.encryptionService.descriptografar(m.conteudo, m.iv);

            return new MensagemEntity({
                id: Number(m.id),
                conversaId: m.conversa_id,
                remetenteId: m.remetente_id,
                conteudo: textoPuro,
                lida: m.lida,
                data_envio: m.data_envio
            });
        });

        return format.reverse()
    }



    async marcarComoLida(mensagemIds: number[], usuarioId: number): Promise<void> {
        await this.ModelMensagem.update(
            { lida: true },
            {
                where: {
                    id: mensagemIds,
                    remetente_id: { [Op.ne]: usuarioId } // Garante que o usuário não marque como lida a própria mensagem
                }
            }
        );
    }

    async buscarPorId(mensagemId: number): Promise<MensagemEntity | null> {
        const mensagem = await this.ModelMensagem.findByPk(mensagemId);

        if (!mensagem) return null;

        const textoPuro = this.encryptionService.descriptografar(mensagem.conteudo, mensagem.iv);

        return new MensagemEntity({
            id: Number(mensagem.id),
            conversaId: mensagem.conversa_id,
            remetenteId: mensagem.remetente_id,
            conteudo: textoPuro,
            lida: mensagem.lida,
            data_envio: mensagem.data_envio
        });
    }

    async atualizarStatus(mensagemId: number, status: string): Promise<void> {
        const lida = status === 'lida' ? true : false;

        await this.ModelMensagem.update(
            { lida },
            { where: { id: mensagemId } }

        );
    }

    async atualizarTexto(mensagemId: number, novoTexto: string): Promise<void> {
        const { conteudo, iv } = this.encryptionService.criptografar(novoTexto);

        await this.ModelMensagem.update(
            { conteudo, iv },
            { where: { id: mensagemId } }
        );
    }

    async deletarMensagem(mensagemId: number): Promise<void> {
        await this.ModelMensagem.destroy(
            { where: { id: mensagemId } }
        )
    }


    async contarTotalNaoLidas(usuarioId: number): Promise<number> {
        return await this.ModelMensagem.count({
            where: {
                lida: false,
                remetente_id: { [Op.ne]: usuarioId }
            },
            include: [{
                model: this.ModelConversa,
                as: 'conversa',
                required: true,
                where: {
                    [Op.or]: [
                        { paciente_id: usuarioId },
                        { profissional_id: usuarioId }
                    ]
                }
            }]
        });

    }

    async contarNaoLidasAgrupadoPorConversa(usuarioId: number): Promise<{ [conversaId: string]: number }> {
        const resultados = await this.ModelMensagem.findAll({
            attributes: [
                'conversa_id',
                [this.ModelConversa.sequelize!.fn('COUNT', this.ModelConversa.sequelize!.col('Mensagem.id')), 'total'] // Alias para o count
            ],
            where: {
                lida: false,
                remetente_id: { [Op.ne]: usuarioId }
            },
            include: [{
                model: this.ModelConversa,
                as: 'conversa',
                attributes: [], 
                required: true,
                where: {
                    [Op.or]: [
                        { paciente_id: usuarioId },
                        { profissional_id: usuarioId }
                    ]
                }
            }],
            group: ['conversa_id'],
            raw: true
        });

        // Converte o array de resultados em um objeto: { "4": 2, "7": 1 }
        const contagens: { [key: string]: number } = {};
        resultados.forEach((res: any) => {
            contagens[res.conversa_id] = parseInt(res.total, 10);
        });

        return contagens;
    }
}