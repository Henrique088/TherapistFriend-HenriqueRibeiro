// src/hooks/media/ensureLocalStream.ts

export async function ensureLocalStream(

    currentStream: MediaStream | null, 
    
    setLocalStream: (stream: MediaStream ) => void ): Promise<MediaStream> {

    if (currentStream) {

        console.log("♻️ Reutilizando stream local.");

        return currentStream;
    }

    console.log("🎥 Solicitando câmera e microfone...");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    setLocalStream(stream);

    console.log( "✅ Stream local criada.");

    return stream;

}