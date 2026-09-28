// src//aplication/use-cases/usuario/ListarUsuarioParaAdminUsecase.ts

import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';

export class ListarUsuarioParaAdminUsecase {
    constructor(
        private usuarioRepository: IUsuarioRepository
    ) {}

    async execute(page: number, limit: number, filtros: {busca?: string }) {
        
        const { data: usuarios, total, pagina, totalPaginas } = await this.usuarioRepository.listar(page, limit, filtros);

        return ({
            usuarios,
            total,
            pagina,
            totalPaginas
        });

    }

}