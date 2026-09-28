// src/application/useCases/especialidade/ListarEspecialidadesUseCase.ts


import { IEspecialidadeRepository } from '../../../domain/repositories/IEspecialidadeRepository';

export class ListarEspecialidadesUseCase {
    constructor(
        private especialidadeRepository: IEspecialidadeRepository
    ) {}

    async execute(){
        // Busca todas as especialidades ordenadas por nome
        const especialidades = await this.especialidadeRepository.listarTodas();
        
        return especialidades.map(esp => ({
            id: esp.id,
            nome: esp.nome
        }));
    }
}