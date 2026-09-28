import { Transaction } from "sequelize";
import { MensagemEntity } from "../entities/MensagemEntity";

export interface IMensagemRepository {

    salvar(mensagem: MensagemEntity): Promise<MensagemEntity>;

    buscarPorConversa(conversaId: number, limit?: number, cursor?: Date): Promise<MensagemEntity[]>;

    marcarComoLida(mensagemIds: number[], usuarioId: number): Promise<void>;

    buscarPorId(mensagemId: number): Promise<MensagemEntity | null>;

    atualizarStatus(mensagemId: number, status: string): Promise<void>;

    atualizarTexto(mensagemId: number, novoTexto: string): Promise<void>;

    deletarMensagem(mensagemId: number): Promise<void>;

    contarTotalNaoLidas(usuarioId: number): Promise<number>;
    
    contarNaoLidasAgrupadoPorConversa(usuarioId: number): Promise<{ [conversaId: string]: number }>;
}