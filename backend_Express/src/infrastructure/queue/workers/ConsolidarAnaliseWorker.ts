// src/infrastructure/queues/workers/ConsolidarAnaliseWorker.ts

import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';
import { EventDispatcherInterface } from "../../../domain/@shared/events/EventDispatcher";
import { RelatorioSessaoGerado } from "../../../domain/events/analysis/RelatorioSessaoGerado"; // Padronizado
import { IAnalisadorGrpcClient } from '../../../domain/services/analysis/IAnalisadorGrpcClient';
import { IAnalysisCacheRepository } from '../../../domain/repositories/IAnalysisCacheRepository';

export const setupConsolidarAnaliseWorker = (
    eventDispatcher: EventDispatcherInterface,
    analysisCacheRepo: IAnalysisCacheRepository
) => {

    const worker = new Worker('analise-sessao', async (job: Job) => {
        const { sessaoId, pacienteId, profissionalId } = job.data;
        console.log(`[Worker Debug] Processando Sessão ID: "${sessaoId}"`);
        try {

            const todasChaves = await redisConnection.keys('sessao:analise:*');
            console.log(`[Worker Debug] Chaves existentes no Redis:`, todasChaves);
            // BUSCA OS DADOS QUE ESTÃO NO REDIS
            const frames = await analysisCacheRepo.buscarTodosFrames(sessaoId);

            console.log("Frames no worker: ", frames);

            if (!frames || frames.length === 0) {
                console.error("Sem dados para gerar relatório");
                return;
            }

            // CONSOLIDA (Soma tudo e tira a média)
            const summaryFormatado = consolidarDadosManualmente(frames);

            console.log(`[Consolidar Analise] summaryFormatado: `, summaryFormatado);
            
            // LIMPA O REDIS
            await analysisCacheRepo.limparDados(sessaoId);

            return {
                jobType: 'gerar-relatorio',
                sessaoId,
                pacienteId,
                profissionalId,
                summary: summaryFormatado
            }


        } catch (error) {
            console.error(`Erro no Worker:`, error);
            throw error;
        }
    },
        { connection: redisConnection });

    worker.on('failed', (job, err) => {
        console.error(`[ConsolidarAnaliseWorker] Envio para ${job?.data.to} falhou permanentemente: ${err.message}`);
    });
};

function consolidarDadosManualmente(frames: any[]): any {
    if (!frames || frames.length === 0) return null;

    // Limpeza e Ordenação Rigorosa
    // Filtra apenas frames que possuem o carimbo de tempo 'at'
    const sortedFrames = frames
        .filter(f => f.at !== undefined && f.at !== null && f.confianca > 0)
        .sort((a, b) => Number(a.at) - Number(b.at));

    if (sortedFrames.length === 0) return null;

    // O marco zero é o 'at' numérico do primeiro frame
    const startTime = Number(sortedFrames[0].at);
    const totalFrames = sortedFrames.length;

    const frequencia: Record<string, number> = {};
    let somaConfianca = 0;

    // Cálculo de métricas globais
    sortedFrames.forEach(f => {
        const emo = f.emocao || f.emocaoPredominante || 'Neutro';
        frequencia[emo] = (frequencia[emo] || 0) + 1;
        somaConfianca += Number(f.confianca) || 0;
    });

    const predominante = Object.keys(frequencia).reduce((a, b) =>
        frequencia[a] > frequencia[b] ? a : b
    , 'Neutro');

    // Criação da Timeline (Amostragem de 10 pontos para melhor visualização)
    const totalPontosDesejados = 10; 
    const step = Math.max(1, Math.floor(totalFrames / totalPontosDesejados));
    
    const timelineReduzida = sortedFrames
        .filter((_, index) => index % step === 0)
        .slice(0, totalPontosDesejados) // Garante que não passe de 10 pontos
        .map((f) => {
            // Cálculo do tempo relativo em milissegundos
            const diffMs = Number(f.at) - startTime;
            
            // Conversão para formato MM:SS
            const totalSeconds = Math.floor(diffMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            const timestampFormatado = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            return {
                timestamp: timestampFormatado,
                label: f.emocao || f.emocaoPredominante || 'Neutro',
                score: Math.round((Number(f.confianca) || 0) * 100)
            };
        });

    // Retorno formatado para o Banco e Front-end
    return {
        emocao_predominante: predominante,
        confianca_media: Math.round((somaConfianca / totalFrames) * 100),
        timeline: timelineReduzida,
        insights_ia: {
            // Regra: Se raiva ou medo aparecerem em mais de 20% da sessão
            nivel_ansiedade: (frequencia['Raiva'] || 0) + (frequencia['Medo'] || 0) > (totalFrames * 0.2) 
                ? 'alto' 
                : 'moderado',
            picos_emocionais: sortedFrames.filter(f => Number(f.confianca) > 0.9).length,
            sugestao_abordagem: "Relatório gerado via telemetria emocional gRPC/YOLO."
        }
    };
}