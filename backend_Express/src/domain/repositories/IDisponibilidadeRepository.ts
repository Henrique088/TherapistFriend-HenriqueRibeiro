// src/domain/repositories/IDisponibilidadeRepository.ts

import { DisponibilidadeEntity } from '../entities/DisponibilidadeEntity';

export interface IDisponibilidadeRepository {
    // Sincroniza a grade semanal do profissional
    substituirGrade(profissionalId: number, disponibilidades: DisponibilidadeEntity[]): Promise<void>;
    
    buscarPorDiaSemana(profissionalId: number, diaSemana: number): Promise<DisponibilidadeEntity[]>;
    
    listarGradeCompleta(profissionalId: number): Promise<DisponibilidadeEntity[]>;
}