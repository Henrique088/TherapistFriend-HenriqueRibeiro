// tests/unit/application/utils/DataHandler.spec.ts

import { DataHandler } from './DataHandler';

describe('DataHandler', () => {
    describe('parseToUTC', () => {
        it('deve converter uma string "YYYY-MM-DD" para Date zerado em UTC', () => {
            const resultado = DataHandler.parseToUTC('2026-01-25');

            expect(resultado.getUTCFullYear()).toBe(2026);
            expect(resultado.getUTCMonth()).toBe(0); // Janeiro (0)
            expect(resultado.getUTCDate()).toBe(25);
            expect(resultado.getUTCHours()).toBe(0);
            expect(resultado.getUTCMinutes()).toBe(0);
            expect(resultado.getUTCSeconds()).toBe(0);
            expect(resultado.getUTCMilliseconds()).toBe(0);
        });

        it('deve converter uma string em formato ISO ("YYYY-MM-DDTHH:mm:ss") ignorando horário local/ISO', () => {
            const resultado = DataHandler.parseToUTC('2026-05-10T15:30:00.000Z');

            expect(resultado.getUTCFullYear()).toBe(2026);
            expect(resultado.getUTCMonth()).toBe(4); // Maio (4)
            expect(resultado.getUTCDate()).toBe(10);
            expect(resultado.getUTCHours()).toBe(0);
        });

        it('deve converter uma string separada por espaço ("YYYY-MM-DD HH:mm:ss")', () => {
            const resultado = DataHandler.parseToUTC('2026-12-31 23:59:59');

            expect(resultado.getUTCFullYear()).toBe(2026);
            expect(resultado.getUTCMonth()).toBe(11); // Dezembro (11)
            expect(resultado.getUTCDate()).toBe(31);
            expect(resultado.getUTCHours()).toBe(0);
        });

        it('deve zerar as horas em UTC se receber uma instância de Date', () => {
            const dataOriginal = new Date(Date.UTC(2026, 2, 15, 14, 45, 30));
            const resultado = DataHandler.parseToUTC(dataOriginal);

            expect(resultado.getUTCFullYear()).toBe(2026);
            expect(resultado.getUTCMonth()).toBe(2);
            expect(resultado.getUTCDate()).toBe(15);
            expect(resultado.getUTCHours()).toBe(0);
            expect(resultado.getUTCMinutes()).toBe(0);
        });
    });

    describe('toISOString e formatUTCtoYMD', () => {
        it('deve retornar a string ISO completa', () => {
            const data = new Date(Date.UTC(2026, 0, 25, 0, 0, 0, 0));
            expect(DataHandler.toISOString(data)).toBe('2026-01-25T00:00:00.000Z');
        });

        it('deve formatar para YYYY-MM-DD extraído do UTC', () => {
            const data = new Date(Date.UTC(2026, 8, 5, 23, 0, 0, 0));
            expect(DataHandler.formatUTCtoYMD(data)).toBe('2026-09-05');
        });
    });

    describe('isSameDayUTC', () => {
        it('deve retornar true para duas datas no mesmo dia em UTC, independente do horário', () => {
            const dataA = new Date(Date.UTC(2026, 4, 1, 10, 0, 0));
            const dataB = new Date(Date.UTC(2026, 4, 1, 22, 30, 0));

            expect(DataHandler.isSameDayUTC(dataA, dataB)).toBe(true);
        });

        it('deve retornar false para datas em dias diferentes em UTC', () => {
            const dataA = new Date(Date.UTC(2026, 4, 1, 23, 59, 59));
            const dataB = new Date(Date.UTC(2026, 4, 2, 0, 0, 0));

            expect(DataHandler.isSameDayUTC(dataA, dataB)).toBe(false);
        });
    });

    describe('getInicioDaSemanaUTC e getFimDaSemanaUTC', () => {
        it('deve retornar a segunda-feira às 00:00:00 UTC para um dia no meio da semana (ex: Quarta-feira)', () => {
            // 28 de Janeiro de 2026 é uma Quarta-feira
            const quartaFeira = new Date(Date.UTC(2026, 0, 28, 14, 0, 0));
            const inicioSemana = DataHandler.getInicioDaSemanaUTC(quartaFeira);

            // Segunda-feira deve ser 26 de Janeiro de 2026
            expect(inicioSemana.getUTCDate()).toBe(26);
            expect(inicioSemana.getUTCHours()).toBe(0);
            expect(inicioSemana.getUTCMinutes()).toBe(0);
        });

        it('deve retornar a segunda-feira da mesma semana quando fornecido um Domingo (0)', () => {
            // 1 de Fevereiro de 2026 é um Domingo
            const domingo = new Date(Date.UTC(2026, 1, 1, 18, 0, 0));
            const inicioSemana = DataHandler.getInicioDaSemanaUTC(domingo);

            // Segunda-feira anterior deve ser 26 de Janeiro de 2026
            expect(inicioSemana.getUTCMonth()).toBe(0); // Janeiro
            expect(inicioSemana.getUTCDate()).toBe(26);
        });

        it('deve retornar o fim da semana (Domingo 23:59:59.999 UTC)', () => {
            // 28 de Janeiro de 2026 (Quarta-feira)
            const quartaFeira = new Date(Date.UTC(2026, 0, 28, 10, 0, 0));
            const fimSemana = DataHandler.getFimDaSemanaUTC(quartaFeira);

            // Domingo correspondente: 1 de Fevereiro de 2026
            expect(fimSemana.getUTCMonth()).toBe(1); // Fevereiro
            expect(fimSemana.getUTCDate()).toBe(1);
            expect(fimSemana.getUTCHours()).toBe(23);
            expect(fimSemana.getUTCMinutes()).toBe(59);
            expect(fimSemana.getUTCSeconds()).toBe(59);
            expect(fimSemana.getUTCMilliseconds()).toBe(999);
        });
    });

    describe('getInicioDoMesUTC e getFimDoMesUTC', () => {
        it('deve retornar o primeiro dia do mês às 00:00:00 UTC', () => {
            const data = new Date(Date.UTC(2026, 1, 15, 12, 0, 0)); // 15 de Fevereiro
            const inicioMes = DataHandler.getInicioDoMesUTC(data);

            expect(inicioMes.getUTCFullYear()).toBe(2026);
            expect(inicioMes.getUTCMonth()).toBe(1);
            expect(inicioMes.getUTCDate()).toBe(1);
            expect(inicioMes.getUTCHours()).toBe(0);
        });

        it('deve retornar o último dia do mês às 23:59:59.999 UTC (considerando ano bissexto)', () => {
            // 2028 é ano bissexto (Fevereiro tem 29 dias)
            const dataBissexto = new Date(Date.UTC(2028, 1, 10));
            const fimMesBissexto = DataHandler.getFimDoMesUTC(dataBissexto);

            expect(fimMesBissexto.getUTCDate()).toBe(29);
            expect(fimMesBissexto.getUTCHours()).toBe(23);
            expect(fimMesBissexto.getUTCMinutes()).toBe(59);
            expect(fimMesBissexto.getUTCSeconds()).toBe(59);
            expect(fimMesBissexto.getUTCMilliseconds()).toBe(999);
        });

        it('deve retornar 31 de Dezembro às 23:59:59.999 UTC para o mês de Dezembro', () => {
            const dezembro = new Date(Date.UTC(2026, 11, 5));
            const fimDezembro = DataHandler.getFimDoMesUTC(dezembro);

            expect(fimDezembro.getUTCMonth()).toBe(11);
            expect(fimDezembro.getUTCDate()).toBe(31);
        });
    });
});