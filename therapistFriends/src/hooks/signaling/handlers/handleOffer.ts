// src/hooks/signaling/handlers/handleOffer.ts

import { Socket } from "socket.io-client";

import { ensureLocalStream } from "../../media/ensureLocalStream";

interface HandleOfferParams {

    offer: RTCSessionDescriptionInit;

    sessaoId: string;

    socket: Socket;

    isProfissional: boolean;

    localStream: MediaStream | null;

    setLocalStream: (stream: MediaStream) => void;

    initWebRTC: (stream: MediaStream) => Promise<RTCPeerConnection>;

    startAnalysis: (stream: MediaStream) => void;
   
    pendingIceCandidates: React.MutableRefObject<RTCIceCandidateInit[]>;
}

export async function handleOffer(params: HandleOfferParams) {

    // Apenas o paciente (não profissional) deve responder a ofertas neste fluxo
    if (params.isProfissional) {

        console.warn("⚠️ [handleOffer] Profissional recebeu uma Offer inesperada. Ignorando...");
        return;
    }

    try {

        console.log("📥 [handleOffer] Garantindo stream local para o paciente...");

        const stream = await ensureLocalStream( params.localStream, params.setLocalStream );

        console.log("⚙️ [handleOffer] Inicializando WebRTC para responder...");

        const peer = await params.initWebRTC(stream);

        // 1. Configura a descrição remota recebida do profissional
        await peer.setRemoteDescription(new RTCSessionDescription(params.offer));

        console.log("✅ [handleOffer] RemoteDescription (Offer) configurado.");

        // Processa todos os candidatos ICE que chegaram antes da Offer ser configurada
        if (params.pendingIceCandidates.current.length > 0) {
            console.log(
                `🧊 [handleOffer] Processando ${params.pendingIceCandidates.current.length} ICE candidates represados...`
            );
            for (const candidate of params.pendingIceCandidates.current) {

                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
            params.pendingIceCandidates.current = [];
        }

        // 2. Cria a Answer SDP
        const answer = await peer.createAnswer();
        
        await peer.setLocalDescription(answer);

        // 3. Envia a Answer de volta via WebSocket
        params.socket.emit("answer", { sessaoId: params.sessaoId, answer });

        console.log("📡 [handleOffer] Answer enviada com sucesso.");

        // 4. Inicia a análise de emoções no stream do paciente
        params.startAnalysis(stream);

    } catch (error) {

        console.error("❌ [handleOffer] Erro fatal durante o processamento da Offer:", error);
        throw error;
    }
}