// src/hooks/signaling/handlers/handleAnswer.ts

export async function handleAnswer(

    answer: RTCSessionDescriptionInit,

    peerRef: React.MutableRefObject<RTCPeerConnection | null>,

    pendingIceCandidates: React.MutableRefObject<RTCIceCandidateInit[]>
) {
    const pc = peerRef.current;

    if (!pc) {
        console.warn("⚠️ [handleAnswer] Instância de RTCPeerConnection não encontrada.");
        return;
    }

    // Evita aplicar a Answer se a conexão não estiver esperando por uma (ex: disparos duplicados)
    if (pc.signalingState !== "have-local-offer") {
        console.warn(
            `⚠️ [handleAnswer] Answer ignorada. Estado atual: '${pc.signalingState}' (esperado: 'have-local-offer').`
        );
        return;
    }

    try {

        console.log("📥 [handleAnswer] Aplicando Remote Description (Answer)...");

        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        console.log("✅ [handleAnswer] Remote Description (Answer) configurada com sucesso.");

        // Clona e limpa a fila PRIMEIRO para evitar Race Condition durante os awaits
        if (pendingIceCandidates.current.length > 0) {
            const candidatesToProcess = [...pendingIceCandidates.current];
            pendingIceCandidates.current = [];

            console.log(
                `🧊 [handleAnswer] Processando ${candidatesToProcess.length} ICE candidates represados...`
            );

            // Isolamento de erro individual para não travar a fila inteira
            for (const candidate of candidatesToProcess) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (candidateError) {
                    console.error("❌ [handleAnswer] Erro ao aplicar candidato represado:", candidateError);
                }
            }
        }
    } catch (error) {
        console.error("❌ [handleAnswer] Erro fatal ao configurar Remote Description da Answer:", error);
    }
}