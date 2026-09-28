// src/application/use-cases/Profissional/CompletarPerfilProfissionalUseCase.ts

import AppError from '../../errors/AppError';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { ProfissionalEntity } from '../../../domain/entities/ProfissionalEntity';

export class CompletarPerfilProfissionalUseCase {
    constructor(
        private profissionalRepository: IProfissionalRepository
    ) {}

    async execute(idUsuario: number, dados: { cpf: string, crp: string, bio: string, especialidadesIds: number[] }) {
        
        // Busca o profissional pelo ID do usuário
        const profissional: ProfissionalEntity | null = await this.profissionalRepository.buscarPorUsuario(idUsuario);

        if (!profissional) {
            throw new AppError("Perfil profissional não encontrado para este usuário.", 404);
        }

        // Transfere os dados para a entidade (Validação de Domínio)
        profissional.completarDados(dados.cpf, dados.crp, dados.bio);

        // Atualiza o status para "pendente" se ainda não tiver sido validado
        if (profissional.status === 'pendente' || profissional.status ===  'revogado') {
            profissional.pendenciar();
        }


        // Persistência com Transação
        const transaction = await this.profissionalRepository.iniciarTransacao();
        
        try {
            // Salva os dados básicos (CPF, CRP, BIO)
            await this.profissionalRepository.atualizar(profissional, { transaction });

            // Sincroniza as especialidades na tabela pivô
            await this.profissionalRepository.vincularEspecialidades(
                profissional.id!, 
                dados.especialidadesIds, 
                transaction // Passando a transação diretamente
            );

            await transaction.commit();
            
            // Retorna a entidade atualizada
            return await this.profissionalRepository.buscarPorUsuario(idUsuario);

        } catch (err) {
            await transaction.rollback();
            
            throw new AppError("Erro ao salvar dados profissionais: " + (err as Error).message, 500);
        }
    }
}