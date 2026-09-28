// src/Components/Video/ConnectionStatusOverlay.tsx

import styles from "./ConnectionStatusOverlay.module.css";
import { useVideoSession } from "../../contexts/VideoSessionContext";
import { ConnectionStatus } from "../../hooks/connection/types";
import { FiRefreshCw, FiClock, FiAlertCircle } from "react-icons/fi";

export function ConnectionStatusOverlay() {
    const { connectionState } = useVideoSession();

    // Não exibe overlay durante o fluxo normal de espera ou chamada ativa
    if (
        connectionState.status !== ConnectionStatus.RECONNECTING &&
        connectionState.status !== ConnectionStatus.TIMEOUT
    ) {
        return null;
    }

    const isReconnecting =
        connectionState.status === ConnectionStatus.RECONNECTING;

    return (
        <div className={styles.overlay}>
            <div
                className={`${styles.card} ${
                    isReconnecting ? styles.reconnecting : styles.timeout
                }`}
            >
                <div className={styles.iconWrapper}>
                    {isReconnecting ? (
                        <FiRefreshCw className={styles.icon} />
                    ) : (
                        <FiAlertCircle className={styles.icon} />
                    )}
                </div>

                <span className={styles.eyebrow}>
                    {isReconnecting
                        ? "CONEXÃO"
                        : "SESSÃO FINALIZADA"}
                </span>

                {isReconnecting && (
                    <>
                        <h2>Reconectando...</h2>

                        <p>
                            A conexão com o outro participante foi
                            interrompida.
                        </p>

                        <span className={styles.description}>
                            Aguardando o retorno para continuar a sessão.
                        </span>

                        {connectionState.reconnectCountdown !== undefined && (
                            <div className={styles.countdownWrapper}>
                                <FiClock className={styles.countdownIcon} />

                                <div className={styles.countdown}>
                                    <strong>
                                        {connectionState.reconnectCountdown}
                                    </strong>

                                    <span>segundos</span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {connectionState.status === ConnectionStatus.TIMEOUT && (
                    <>
                        <h2>Sessão encerrada</h2>

                        <p>
                            Não foi possível restabelecer a conexão entre os
                            participantes.
                        </p>

                        <span className={styles.description}>
                            O tempo máximo para reconexão foi atingido.
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}