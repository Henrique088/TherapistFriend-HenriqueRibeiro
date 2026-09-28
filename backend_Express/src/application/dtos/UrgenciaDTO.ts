

export interface SolicitarUrgenciaDTO {
    profissionalId: number;
    pacienteId: number;
    motivo: string;
    janelaDeTempo:  '3_dias' | '7_dias';
}