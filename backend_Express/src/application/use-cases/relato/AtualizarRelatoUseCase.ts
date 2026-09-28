// src/application/use-cases/relato/AtualizarRelatoUseCase.ts

import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import AppError from '../../errors/AppError';
import { RelatoEntity } from '../../../domain/entities/RelatoEntity';
import { AtualizarRelatoDTO } from '../../dtos/RelatoDTO';

export class AtualizarRelatoUseCase {
    constructor(
        private relatoRepository: IRelatoRepository
    ) { }

    async execute({ relatoId, usuarioId, novoConteudo }: AtualizarRelatoDTO): Promise<RelatoEntity> {

        const relato = await this.relatoRepository.buscarPorId(relatoId);

        if (!relato) {
            throw new AppError('Relato não encontrado', 404);
        }

        if (relato.paciente_id !== usuarioId) {
            throw new AppError('Usuário não autorizado a atualizar este relato', 403);
        }

       // Atualiza apenas os campos fornecidos 
        relato.mudarAnonimato(novoConteudo?.anonimo ?? relato.anonimo);
        relato.mudarCategoria(novoConteudo?.categoria ?? relato.categoria);
        relato.mudarTexto(novoConteudo?.texto ?? relato.texto);
        relato.mudarTitulo(novoConteudo?.titulo ?? relato.titulo);

        const relatoAtualizado = await this.relatoRepository.atualizarRelato(relato);

        return relatoAtualizado;
    }
}