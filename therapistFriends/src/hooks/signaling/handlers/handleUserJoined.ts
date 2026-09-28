export async function handleUserJoined(

    isProfissional: boolean,

    startCall: () => Promise<void>

) {

    console.log("👤 Participante entrou.");

    if (!isProfissional)
        return;

    await startCall();

}