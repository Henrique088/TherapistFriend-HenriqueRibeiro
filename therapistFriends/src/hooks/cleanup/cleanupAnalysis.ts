// src/hooks/cleanup/cleanupAnalysis.ts

export function cleanupAnalysis(

    frameInterval: React.MutableRefObject<NodeJS.Timeout | null>

) {

    if (!frameInterval.current)
        return;

    clearInterval(frameInterval.current);

    frameInterval.current = null;

    console.log( "🧠 Emotion Analysis encerrada.");

}