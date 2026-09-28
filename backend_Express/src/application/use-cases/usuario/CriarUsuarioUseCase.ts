// src/application/use-cases/usuario/CriarUsuarioUseCase.ts

import AppError from '../../../application/errors/AppError';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { ICriptografiaService } from '../../../domain/services/ICriptografiaService';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { IEntidadeRelacionadaFactory } from '../../factories/IEntidadeRelacionadaFactory';
import { UsuarioRegistroBdDTO, UsuarioRegistroDTO, UsuarioReponseDTO } from '../../dtos/UsuarioDTO';
import { Sequelize } from 'sequelize';


export class CriarUsuarioUseCase {

    constructor(
        private usuarioRepository: IUsuarioRepository,
        private detalhesFactory: IEntidadeRelacionadaFactory,
        private criptografiaService: ICriptografiaService,
        private sequelize: Sequelize
    ) { }

    async execute(dados: UsuarioRegistroDTO): Promise<UsuarioReponseDTO> {
       
        const { nome, email, telefone, senha, tipo_usuario } = dados as UsuarioRegistroDTO;

        let transaction = await this.sequelize.transaction();

        const existingUser = await this.usuarioRepository.buscarPorEmail(email);
        if (existingUser) { throw new AppError("E-mail já registrado.", 409); }

        const existingTelefone = await this.usuarioRepository.buscarPorTelefone(telefone);
        if (existingTelefone) { throw new AppError("Telefone já registrado.", 409); }

        const senhaHash = await this.criptografiaService.hash(senha);
        const dadosCriacao: UsuarioRegistroBdDTO = { nome, email, telefone, senha_hash: senhaHash, tipo_usuario, ativo: true };

        // --- FLUXO TRANSACIONAL ---
        let usuarioEntity: UsuarioEntity | undefined;
        let entidadeRelacionadaDTO: object | null = null;
        // let transaction: Transaction | undefined;

        try {
            // INICIA A TRANSAÇÃO: Cria o objeto de transação no banco de dados.
            transaction = await this.usuarioRepository.iniciarTransacao();

            if (!transaction) {
                throw new AppError('Falha ao iniciar transação', 500);
            }


            // Criação do Usuário Principal (PASSANDO A TRANSAÇÃO)
            usuarioEntity = await this.usuarioRepository.criar(dadosCriacao, transaction);

            if (!usuarioEntity.id) {
                throw new AppError("Falha na infraestrutura: ID de usuário não gerado.", 500);
            }

            // ORQUESTRAÇÃO DELEGADA À FÁBRICA (PASSANDO A TRANSAÇÃO)
            entidadeRelacionadaDTO = await this.detalhesFactory.criarDetalhes(
                usuarioEntity,
                transaction
            );

            // COMMIT DA TRANSAÇÃO: Se tudo deu certo, salva todas as mudanças.
            await this.usuarioRepository.commit(transaction);

        } catch (error) {
            // ROLLBACK DA TRANSAÇÃO: Se algo falhou, desfaz TODAS as alterações pendentes.
            if (transaction) {
                console.error("Erro na transação. Realizando rollback.", error);
                await this.usuarioRepository.rollback(transaction);
            } else {
                // Caso a falha ocorra antes mesmo de iniciar a transação (improvável neste bloco)
                console.error("Erro na transação. Transação não estava ativa.", error);
            }

            // Relança o erro para a camada superior (Controller/API)
            throw error;
        }

        // Retorno DTO
        return {
            ...usuarioEntity.toJSON(),
            entidadeRelacionada: entidadeRelacionadaDTO
        };
    }
}