// src/application/utils/TimeHandler.ts

import AppError from "../errors/AppError";

export class TimeHandler {
    /**
     * Converte string "HH:mm" para minutos totais desde o início do dia
     * Ex: "01:30" -> 90
     */
    static stringParaMinutos(hora: string): number {
        // ^([01][0-9]|2[0-3]) -> Horas (00-23)
        // :[0-5][0-9]         -> Minutos (00-59)
        // (:[0-5][0-9])?$     -> Segundos opcionais (:00)
        const regexHoraValida = /^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

        if (!regexHoraValida.test(hora)) {
            throw new Error(`Formato de hora inválido: ${hora}. Use o padrão HH:mm (ex: 08:30)`);
        }
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    /**
     * Converte minutos totais para string "HH:mm"
     * Ex: 90 -> "01:30"
     */
    static minutosParaString(totalMinutos: number): string {
        const h = Math.floor(totalMinutos / 60).toString().padStart(2, '0');
        const m = (totalMinutos % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    /**
     * Extrai a hora formatada "HH:mm" de um objeto Date de forma segura.
     * Ex: Date("...T09:05:00") -> "09:05"
     */
    static dateParaStringHora(date: Date): string {
        const horas = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    }

    /**
     * Extrai apenas a string "HH:mm" de um objeto Date
     */
    static dateParaString(date: Date): string {
        
        return date.toISOString().split('T')[1].substring(0, 5);
    }

    /**
     * Verifica se dois intervalos de tempo se sobrepõem
     * Lógica: (InícioA < FimB) E (FimA > InícioB)
     */
    static verificarColisao(
        inicioA: string,
        fimA: string,
        inicioB: string | Date,
        fimB: string | Date
    ): boolean {
        const iA = this.toMinutos(inicioA);
        const fA = this.toMinutos(fimA);
        const iB = this.toMinutos(inicioB);
        const fB = this.toMinutos(fimB);

        return iA < fB && fA > iB;
    }

    /**
     * Helper interno para normalizar entrada para minutos
     */
    private static toMinutos(valor: string | Date): number {
        if (valor instanceof Date) {
            return valor.getHours() * 60 + valor.getMinutes();
        }
        return this.stringParaMinutos(valor);
    }

    /**
     * Gera uma lista de horários entre um início e fim baseado em um intervalo
     */
    static gerarJanelas(inicio: string, fim: string, intervaloMinutos: number): string[] {
        const janelas: string[] = [];
        let atual = this.stringParaMinutos(inicio);
        const limite = this.stringParaMinutos(fim);

        while (atual + intervaloMinutos <= limite) {
            janelas.push(this.minutosParaString(atual));
            atual += intervaloMinutos;
        }

        return janelas;
    }


    
}