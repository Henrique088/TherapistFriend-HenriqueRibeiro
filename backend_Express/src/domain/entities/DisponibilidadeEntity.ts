// src/domain/entities/DisponibilidadeEntity.ts

import AppError from "../../application/errors/AppError";

export interface DisponibilidadeProps {
    id?: number;
    profissionalId: number;
    diaSemana: number; // 0-6 (Domingo a Sábado)
    horaInicio: string; // Formato "HH:mm"
    horaFim: string;    // Formato "HH:mm"
    ativo: boolean;
}

export class DisponibilidadeEntity {
    private props: DisponibilidadeProps;

    constructor(props: DisponibilidadeProps) {
        this.validarDiaSemana(props.diaSemana);
        this.validarHorario(props.horaInicio, props.horaFim);

        this.props = {
            ...props,
            ativo: props.ativo ?? true
        };
    }

    private validarDiaSemana(dia: number) {
        if (dia < 0 || dia > 6) {
            throw new AppError("Dia da semana inválido. Deve ser entre 0 (Domingo) e 6 (Sábado).");
        }
    }

    private validarHorario(inicio: string, fim: string) {
        // Validação simples de formato HH:mm e comparação
        if (inicio >= fim) {
            throw new AppError("O horário de início deve ser anterior ao horário de fim.");
        }
    }

    // Getters
    get id(): number | undefined { return this.props.id; }
    get profissionalId(): number { return this.props.profissionalId; }
    get diaSemana(): number { return this.props.diaSemana; }
    get horaInicio(): string { return this.props.horaInicio; }
    get horaFim(): string { return this.props.horaFim; }
    get ativo(): boolean { return this.props.ativo; }
}