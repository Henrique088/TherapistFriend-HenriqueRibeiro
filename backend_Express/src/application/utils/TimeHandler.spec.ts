// src/application/utils/TimeHandler.spec.ts

import { TimeHandler } from './TimeHandler';

describe('TimeHandler', () => {
    
    describe('stringParaMinutos', () => {
        it('deve converter corretamente "08:30" para 510 minutos', () => {
            expect(TimeHandler.stringParaMinutos('08:30')).toBe(510);
        });

        it('deve converter corretamente "00:00" para 0 minutos', () => {
            expect(TimeHandler.stringParaMinutos('00:00')).toBe(0);
        });

        it('deve lançar erro para formato de hora inválido', () => {
            expect(() => TimeHandler.stringParaMinutos('25:00')).toThrow();
            expect(() => TimeHandler.stringParaMinutos('8:30')).toThrow(); 
            expect(() => TimeHandler.stringParaMinutos('abc')).toThrow();
        });
    });

    describe('minutosParaString', () => {
        it('deve converter 510 minutos para "08:30"', () => {
            expect(TimeHandler.minutosParaString(510)).toBe('08:30');
        });

        it('deve formatar corretamente com zeros à esquerda (ex: 5 min -> "00:05")', () => {
            expect(TimeHandler.minutosParaString(5)).toBe('00:05');
        });
    });

    describe('verificarColisao', () => {
        // Intervalo A: 08:00 - 09:00
        const inicioA = '08:00';
        const fimA = '09:00';

        it('deve retornar true se houver sobreposição total', () => {
            expect(TimeHandler.verificarColisao(inicioA, fimA, '08:15', '08:45')).toBe(true);
        });

        it('deve retornar true se houver sobreposição parcial no início', () => {
            expect(TimeHandler.verificarColisao(inicioA, fimA, '07:30', '08:30')).toBe(true);
        });

        it('deve retornar false se os horários forem adjacentes (fim de um é início do outro)', () => {
            // Regra crucial: 09:00 não colide com o que começa às 09:00
            expect(TimeHandler.verificarColisao(inicioA, fimA, '09:00', '10:00')).toBe(false);
        });

        it('deve retornar false se não houver colisão', () => {
            expect(TimeHandler.verificarColisao(inicioA, fimA, '10:00', '11:00')).toBe(false);
        });

        it('deve funcionar comparando string com objeto Date', () => {
            const dataInicio = new Date();
            dataInicio.setHours(8, 30, 0); // 08:30
            const dataFim = new Date();
            dataFim.setHours(9, 30, 0);   // 09:30

            expect(TimeHandler.verificarColisao('08:00', '09:00', dataInicio, dataFim)).toBe(true);
        });
    });

    describe('gerarJanelas', () => {
        it('deve gerar slots de 30 minutos corretamente entre 08:00 e 10:00', () => {
            const resultado = TimeHandler.gerarJanelas('08:00', '10:00', 30);
            expect(resultado).toEqual(['08:00', "08:30", '09:00', "09:30"]);
            
        });

        it('deve retornar array vazio se o intervalo for menor que a duração', () => {
            const resultado = TimeHandler.gerarJanelas('08:00', '08:20', 30);
            expect(resultado).toEqual([]);
        });
    });
});