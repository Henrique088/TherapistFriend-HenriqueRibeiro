// src/hooks/cleanup/cleanupStreams.ts

export function cleanupStreams( localStream: MediaStream | null, remoteStream: MediaStream | null ) {

    localStream?.getTracks().forEach(track => {

        console.log(`⛔ Encerrando ${track.kind}`);

        track.stop();

    });

    remoteStream?.getTracks().forEach(track => { track.stop() });

}