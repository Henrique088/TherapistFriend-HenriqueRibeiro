// src/hooks/signaling/handlers/handleIceCandidate.ts

interface HandleIceCandidateParams {

    candidate: RTCIceCandidateInit;

    peerRef: React.MutableRefObject<RTCPeerConnection | null>;

    pendingIceCandidates: React.MutableRefObject<RTCIceCandidateInit[]>;
}

export async function handleIceCandidate({
    candidate,

    peerRef,

    pendingIceCandidates

}: HandleIceCandidateParams) {
    
    if (!candidate) return;

    const peer = peerRef.current;

    // Se o Peer não existe ou o remoteDescription ainda não foi definido (setRemoteDescription),
    // o candidato NÃO pode ser adicionado agora. Ele deve ir para a fila!
    if (!peer || !peer.remoteDescription || !peer.remoteDescription.type) {
        console.log(
            "⏳ [handleIceCandidate] RemoteDescription ausente. Armazenando candidato na fila..."
        );

        pendingIceCandidates.current.push(candidate);
        return;
    }

    // Se o remoteDescription já foi configurado, adiciona diretamente na conexão
    try {

        await peer.addIceCandidate(new RTCIceCandidate(candidate));

        console.log("✅ [handleIceCandidate] ICE Candidate adicionado com sucesso.");

    } catch (error) {

        console.error("❌ [handleIceCandidate] Erro ao adicionar ICE Candidate:", error);
    }
}