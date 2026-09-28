// src/hooks/signaling/handlers/handleSessionEnded.ts

import { NavigateFunction } from "react-router-dom";
import { toast } from "react-toastify"; 
import { SessionEndedPayload } from "../registerSessionEvents";

interface HandleSessionEndedParams {
    data: SessionEndedPayload;
    isProfissional: boolean;
    navigate: NavigateFunction;
    stopTracks: () => void; // Função para encerrar câmera/microfone
}

export function handleSessionEnded({
    data,
    isProfissional,
    navigate,
    stopTracks
}: HandleSessionEndedParams) {

    console.log("🛑 Sessão encerrada via WebSocket com o payload:", data);

    
    // stopTracks();

    
    // if (data.mensagem) {
    //     toast.info(data.mensagem);
    // }

   
    // if (!isProfissional) {
    
    //     if (data.elegivelParaRelatorio) {
    //         // Sessão com tempo suficiente -> Vai para tela de Avaliação
    //         navigate(`/sessao/avaliando/${data.sessaoId}`);
    //     } else {
    //         // Sessão curta demais -> Redireciona diretamente para o Dashboard sem poder avaliar
    //         navigate('/dashboard');
    //     }
    // } else {
    //     // --- PROFISSIONAL ---
    //     // Sempre vai para o Dashboard (ou histórico de sessões)
    //     navigate('/dashboard');
    // }
}