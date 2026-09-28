// src/hooks/signaling/handlers/handleRoomReady.ts

export async function handleRoomReady(

    shouldCreateOffer: boolean,

    startCall: () => Promise<void>

) {

    console.log("🏁 Sala pronta.");

    if (!shouldCreateOffer)
        return;

    console.log("📞 Iniciando negociação.");

    await startCall();

}