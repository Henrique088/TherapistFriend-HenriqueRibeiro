// src/application/use-cases/agenda/SalvarGradeDisponibilidadeUseCase.ts

import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { DisponibilidadeEntity } from '../../../domain/entities/DisponibilidadeEntity';
import { GradeDTO } from '../../dtos/AgendaDTO'; 


export class SalvarGradeDisponibilidadeUseCase {
    constructor(private disponibilidadeRepository: IDisponibilidadeRepository) {}

    async execute(profissionalId: number, gradesDTO: GradeDTO[]): Promise<void> {

        // Transforma os DTOs em Entidades de Domínio
        const entidades = gradesDTO.map(item => new DisponibilidadeEntity({
            profissionalId,
            diaSemana: item.diaSemana,
            horaInicio: item.horaInicio,
            horaFim: item.horaFim,
            ativo: true
        }));
        // Substitui a grade antiga pela nova
        await this.disponibilidadeRepository.substituirGrade(profissionalId, entidades);
    }
}