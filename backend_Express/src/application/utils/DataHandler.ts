// src/application/utils/DataHandler.ts

export class DataHandler {
    /**
     * Transforma qualquer entrada em um objeto Date UTC (meia-noite Z)
     * Isso garante que "2026-01-25" seja sempre o mesmo instante no mundo todo.
     */
    static parseToUTC(dateInput: string | Date): Date {
        if (dateInput instanceof Date) {
            // Se já for Date, zeramos as horas em UTC
            return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate()));
        }

        // Se for string "2026-01-25T...", pegamos apenas a parte da data
        const apenasData = dateInput.split('T')[0].split(' ')[0];
        const [ano, mes, dia] = apenasData.split('-').map(Number);

        // Criamos explicitamente em UTC 00:00:00.000Z
        return new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
    }

    /**
     * Retorna a string ISO completa (ex: 2026-01-25T00:00:00.000Z)
     * para salvar no banco de dados (timestamptz)
     */
    static toISOString(date: Date): string {
        return date.toISOString();
    }

    /**
     * Apenas para logs da string YYYY-MM-DD pura,
     * mas extraída do valor UTC.
     */
    static formatUTCtoYMD(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    static isSameDayUTC(dateA: Date, dateB: Date): boolean {
        return (
            dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
            dateA.getUTCMonth() === dateB.getUTCMonth() &&
            dateA.getUTCDate() === dateB.getUTCDate()
        );

    }

    /**
     * Retorna o início da semana (Segunda-feira) às 00:00:00 UTC
     */
    static getInicioDaSemanaUTC(date: Date = new Date()): Date {
        const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const day = d.getUTCDay(); // 0 (Dom) a 6 (Sab)

        // Ajuste para segunda-feira: 
        // Se for domingo (0), volta 6 dias. Se for outros dias, subtrai (dia - 1)
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);

        d.setUTCDate(diff);
        d.setUTCHours(0, 0, 0, 0);
        return d;
    }

    /**
     * Retorna o fim da semana (Domingo) às 23:59:59 UTC
     */
    static getFimDaSemanaUTC(date: Date = new Date()): Date {
        const d = this.getInicioDaSemanaUTC(date);
        d.setUTCDate(d.getUTCDate() + 6);
        d.setUTCHours(23, 59, 59, 999);
        return d;
    }

    /**
     * Retorna o início do mês às 00:00:00 UTC
     */
    static getInicioDoMesUTC(date: Date = new Date()): Date {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
    }

    /**
     * Retorna o fim do mês às 23:59:59 UTC
     */
    static getFimDoMesUTC(date: Date = new Date()): Date {
        // Mês + 1 e dia 0 retorna o último dia do mês anterior
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }
}