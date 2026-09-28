// src/domain/repositories/IUrgenciaRepository.ts

import { UrgenciaEntity } from '../entities/UrgenciaEntity';

export interface IUrgenciaRepository {

    criar(urgencia: UrgenciaEntity): Promise<UrgenciaEntity>;

    buscarPorId(id: number): Promise<UrgenciaEntity | null>;

    buscarAtivaPorPaciente(pacienteId: number, profissionalId: number): Promise<UrgenciaEntity | null>;

    listarPendentesPorProfissional(profissionalId: number): Promise<UrgenciaEntity[]>;

    atualizar(urgencia: UrgenciaEntity): Promise<void>;

    listarAtivasPorProfissional(profissionalId: number): Promise<UrgenciaEntity[]>;
    
    verificarSeCedeuHorario(profissionalId: number, pacienteId: number): Promise<Boolean>;
}