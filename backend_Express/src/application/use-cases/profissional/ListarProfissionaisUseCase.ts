// src/application/use-case/profissional/ListarProfissionaisUseCase.ts

import AppError from '../../errors/AppError';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { ListarProfissionaisDTO } from '../../dtos/ProfissionaisDTO';


export class ListarProfissionalUseCase {

    constructor(
        private profissionalRepository: IProfissionalRepository
    ) { }


    /**
         *  Use Case Lista Profissionais e filtra
         */
    async execute({ page, limit, nome, especialidade }: ListarProfissionaisDTO) {
       
        try {
            const currentPage = Math.max(1, page);
            const currentLimit = Math.max(1, limit);


            const { data, total, pagina, totalPaginas } = await this.profissionalRepository.buscarComFiltros(
                {
                    pagina: currentPage,
                    limite: currentLimit,
                    nome,
                    especialidade
                }
            );

            return {
                data,
                total,
                pagina_atual: pagina,
                paginas_totais: totalPaginas
            };
        } catch (error) {
            throw new AppError('Erro ao listar profissionais: ' + (error as Error).message, 500);

        }
    }



}