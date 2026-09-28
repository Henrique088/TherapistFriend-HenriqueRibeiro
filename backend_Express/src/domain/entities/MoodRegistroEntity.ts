// src/domain/entities/MoodRegistroEntity.ts

import AppError from "../../application/errors/AppError";

export type PeriodoMood = 'manha' | 'tarde' | 'noite';
export type MoodType = "ansiedade" | "tristeza" | "raiva" | "medo" | "felicidade" | "neutral"

export interface MoodRegistroProps {
    id?: number;
    usuario_id: number;
    mood: "ansiedade" | "tristeza" | "raiva" | "medo" | "felicidade" | "neutral";
    intensidade: number;
    periodo: PeriodoMood;
    data_referencia: Date;
    criado_em?: Date;
    atualizado_em?: Date;
}

export class MoodRegistroEntity {
    constructor(private props: MoodRegistroProps) {
        this.validar();
    }

    // Getters seguros
    public get id() { return this.props.id; }
    public get usuario_id() { return this.props.usuario_id; }
    public get mood() { return this.props.mood; }
    public get intensidade() { return this.props.intensidade; }
    public get periodo() { return this.props.periodo; }
    public get data_referencia() { return this.props.data_referencia; }

    // ===== REGRA DE DOMÍNIO =====

    private validar(): void {
        if (!this.props.usuario_id) {
            throw new AppError('Usuário é obrigatório');
        }

        if (!this.props.mood) {
            throw new AppError('Mood é obrigatório');
        }

        if (this.props.intensidade < 1 || this.props.intensidade > 5) {
            throw new AppError('Intensidade deve estar entre 1 e 5');
        }

        const periodosValidos: PeriodoMood[] = ['manha', 'tarde', 'noite'];
        if (!periodosValidos.includes(this.props.periodo)) {
            throw new AppError('Período inválido');
        }
    }

    // ===== COMPORTAMENTOS =====

    public atualizarMood(novoMood: MoodType, novaIntensidade: number): void {
        if (!novoMood) throw new Error('Mood inválido');
        if (novaIntensidade < 1 || novaIntensidade > 5) {
            throw new AppError('Intensidade inválida');
        }

        this.props.mood = novoMood;
        this.props.intensidade = novaIntensidade;
    }

    // ===== REGRAS ESTÁTICAS DE DOMÍNIO =====

    static calcularPeriodo(data: Date): PeriodoMood {
        const hora = data.getHours();

        if (hora >= 5 && hora < 12) return 'manha';
        if (hora >= 12 && hora < 18) return 'tarde';
        return 'noite';
    }

    static criarAutomatico(usuario_id: number, mood: MoodType, intensidade: number): MoodRegistroEntity {
        const agora = new Date();

        return new MoodRegistroEntity({
            usuario_id,
            mood,
            intensidade,
            periodo: MoodRegistroEntity.calcularPeriodo(agora),
            data_referencia: agora
        });
    }

    // Conversão segura
    public toJSON(): MoodRegistroProps {
        return { ...this.props };
    }
}
