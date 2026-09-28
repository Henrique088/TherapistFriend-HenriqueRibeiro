// src/infrastructure/grpc/AnalisadorGrpcClient.ts

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { IAnalisadorGrpcClient } from '../../domain/services/analysis/IAnalisadorGrpcClient';

export class AnalisadorGrpcClient implements IAnalisadorGrpcClient {
    private client: any;

    constructor() {
        const PROTO_PATH = path.resolve(__dirname, './proto/analisador.proto');
        
        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true, // Mantém nomes originais (ex: "sessaoId" ao invés de "sessao_id")
            longs: String, // Converte números grandes (int64) para string
            enums: String, // Converte enums para strings
            defaults: true, // Inclui valores padrão definidos no proto
            oneofs: true
        });

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

        // Acessa o package 'emotion' definido no .proto
        const emotionPackage = protoDescriptor.emotion;

        if (!emotionPackage) {
            throw new Error("Erro crítico: Namespace 'emotion' não encontrado no .proto");
        }

        const url = process.env.GRPC_ANALISADOR_URL || 'localhost:50051';

        this.client = new emotionPackage.AnalisadorService(
            url,
            grpc.credentials.createInsecure() // Sem SSL/TLS (apenas para desenvolvimento)
        );

        console.log("--- gRPC CLIENT INICIADO ---");
        console.log("Conectado em:", url);
    }

    async analisarFrame(request: { sessaoId: string, imagem: Buffer }): Promise<{ emocao: string; confianca: number }> {
        console.log("[gRPC-Client] Chamando DetectEmotion no Python...");
        return new Promise((resolve, reject) => {
            // Chaves 'sessaoId' e 'imagem' batem com FrameRequest do proto
            this.client.DetectEmotion(request, (err: any, response: any) => {
                if (err) {
          console.error(`[gRPC-Client] Erro na resposta: ${err.code} - ${err.message}`);
          return reject(err);
        }
        console.log("[gRPC-Client] Resposta recebida com sucesso!");
        resolve(response);
            });
        });
    }

    async obterResumoConsolidado(request: { sessaoId: string }): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.ObterResumoConsolidado(request, (err: any, response: any) => {
                if (err) return reject(err);
                resolve(response);
            });
        });
    }
}