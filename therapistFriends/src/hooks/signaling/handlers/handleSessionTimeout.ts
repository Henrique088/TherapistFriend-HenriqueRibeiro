// src/hooks/signaling/handlers/handleSessionTimeout.ts

import { NavigateFunction } from "react-router-dom";
import { useUser } from '../../../contexts/UserContext';

export function handleSessionTimeout(
    stopTracks: () => void,
    navigate: NavigateFunction
) {
    
    console.log("⏰ Sessão encerrada automaticamente.");

    stopTracks();

    const {usuario} = useUser();

    if ( usuario?.tipo_usuario === 'profissional') {
        navigate("/relatorio/processando");
    } else {
        navigate("/sessao/avaliando/:id");
    }
    navigate("/dashboard");

}