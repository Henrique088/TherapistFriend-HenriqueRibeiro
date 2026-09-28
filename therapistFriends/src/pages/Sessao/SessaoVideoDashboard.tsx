// src/Components/Video/SessaoVideoDashboard.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useVideoSession } from '../../contexts/VideoSessionContext';
import { useUser } from '../../contexts/UserContext';

import { VideoPlayer } from '../../Components/Video/VideoPlayer';
import { EmotionBadge } from '../../Components/Video/EmotionBadge';
import { ConnectionStatusOverlay } from '../../Components/Video/ConnectionStatusOverlay';
import { RemoteVideoArea } from '../../Components/Video/RemoteVideoArea';

import { ConnectionStatus } from '../../hooks/connection/types';

import {IoCallOutline, IoChevronUpOutline, IoMicOffSharp, IoMicSharp } from 'react-icons/io5';

import { FiCamera, FiCameraOff, FiActivity, FiShield, FiInfo, FiAlertCircle } from 'react-icons/fi';


import styles from './SessaoVideoDashboard.module.css';

export const SessaoVideoDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { usuario } = useUser();

    const isProfissional = usuario?.tipo_usuario === 'profissional';

    const [showControls, setShowControls] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const {
        localStream,
        remoteStream,
        currentEmotion,
        isCallStarted,
        startCall,
        endCall,
        sessaoId,
        socketSignaling,
        analysisError,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoDisabled,
        connectionState,
    } = useVideoSession();

    /*
     * Obtém o estado real das tracks do MediaStream.
     * Isso evita inconsistência entre o estado visual
     * e o estado efetivo do microfone/câmera.
     */
    const audioTrack = localStream?.getAudioTracks()[0];
    const videoTrack = localStream?.getVideoTracks()[0];

    const effectiveAudioMuted = audioTrack
        ? !audioTrack.enabled
        : isAudioMuted;

    const effectiveVideoDisabled = videoTrack
        ? !videoTrack.enabled
        : isVideoDisabled;

    const getConnectionLabel = () => {
        switch (connectionState.status) {
            case ConnectionStatus.CONNECTED:
                return 'Sessão ao vivo';

            case ConnectionStatus.RECONNECTING:
                return 'Reconectando';

            case ConnectionStatus.TIMEOUT:
                return 'Sessão encerrada';

            default:
                return 'Aguardando conexão';
        }
    };

    const isConnectionLive = isCallStarted && connectionState.status === ConnectionStatus.CONNECTED;

    /*
     * Mantém a confiança sempre dentro do intervalo esperado.
     */
    const confidence = currentEmotion
        ? Math.max( 0, Math.min(100, currentEmotion.confianca * 100) ) : 0;

    const handleFinalizarSessao = async () => {
        if (isFinishing) return;

        if (
            !window.confirm( 'Deseja encerrar a consulta e gerar o relatório?' )
        ) {
            return;
        }

        setIsFinishing(true);

        try {
            socketSignaling?.emit('end-session', { sessaoId });

            // endCall();

            // await api.patch(
            //     `/sessoes/${sessaoId}/encerrar`
            // );

            // if (usuario?.tipo_usuario === 'profissional') {

            //     navigate('/relatorio/processando');

            // } else {
            //     navigate(`/sessao/avaliando/${sessaoId}`);
            // }
        } catch (error) {
            // console.error( 'Erro ao finalizar sessão:', error );

            // toast.error( 'Erro ao finalizar sessão.' );
        } finally {
            setIsFinishing(false);
        }
    };

    return (
        <div className={styles.dashboard}>
            <ConnectionStatusOverlay />

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className={styles.header}>
                <div className={styles.headerIdentity}>
                    <div className={styles.brandMark}>
                        TF
                    </div>

                    <div className={styles.brandText}>
                        <span className={styles.brandName}>
                            TherapistFriend
                        </span>

                        <span className={styles.sessionLabel}>
                            Consulta online
                        </span>
                    </div>
                </div>

                <div className={styles.headerCenter}>
                    <div
                        className={`${styles.connectionStatus} ${isConnectionLive ? styles.connectionLive : '' }`}
                    >
                        <span className={ styles.connectionDot }/>

                        <span>
                            {isCallStarted ? getConnectionLabel() : 'Aguardando início'}
                        </span>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    {isProfissional ? (
                        !isCallStarted ? (
                            <button
                                type="button"
                                onClick={startCall}
                                className={styles.startButton}
                                disabled={isFinishing}
                            >
                                Iniciar consulta
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={ handleFinalizarSessao }
                                className={ styles.finishButton }
                                disabled={isFinishing}
                            >
                                {isFinishing ? 'Finalizando...' : 'Finalizar consulta'}
                            </button>
                        )
                    ) : (
                        <div
                            className={`${styles.patientStatus} ${isConnectionLive ? styles.patientStatusLive : '' }`} >
                            <span />

                            {isConnectionLive ? 'Em consulta' : 'Aguardando profissional'}
                        </div>
                    )}
                </div>
            </header>

            {/* =====================================================
                ÁREA PRINCIPAL
            ===================================================== */}

            <main className={styles.main}>
                {/* =================================================
                    VÍDEO DO PARTICIPANTE
                ================================================= */}

                <section className={styles.remoteSection}>
                    <div className={styles.remoteHeader}>
                        <div className={styles.remoteTitleBlock}>
                            <span className={ styles.sectionEyebrow } >
                                CONSULTA
                            </span>

                            <h1>
                                {isProfissional ? 'Atendimento em andamento' : 'Sua consulta'}
                            </h1>

                            <p className={ styles.sectionDescription } >
                                {isConnectionLive
                                    ? 'Conexão estabelecida com segurança.'
                                    : 'O ambiente da consulta está sendo preparado.'}
                            </p>
                        </div>

                        {isProfissional &&
                            currentEmotion && (
                                <div className={ styles.emotionBadgeWrapper } >
                                    <EmotionBadge data={currentEmotion} />
                                </div>
                            )}
                    </div>

                    <div className={styles.remoteVideo}>
                        <RemoteVideoArea
                            remoteStream={remoteStream}
                            isCallStarted={isCallStarted}
                            isProfissional={ isProfissional }
                            isParticipantOnline={ connectionState.status !== ConnectionStatus.TIMEOUT }
                            connectionState={ connectionState }
                        />
                    </div>
                </section>

                {/* =================================================
                    PAINEL LATERAL
                ================================================= */}

                <aside className={styles.sidebar}>
                    {/* =================================================
                        PRÉVIA LOCAL
                    ================================================= */}

                    <section className={styles.localCard}>
                        <div className={styles.cardHeader}>
                            <div>
                                <span className={ styles.cardEyebrow } >
                                    SUA CÂMERA
                                </span>

                                <h2>
                                    Pré-visualização
                                </h2>
                            </div>

                            <span className={ styles.localStatus } >
                                <span />
                                Você
                            </span>
                        </div>

                        <div className={styles.localVideo}>
                            <VideoPlayer stream={localStream} isLocal />

                            {effectiveVideoDisabled && (
                                <div className={ styles.cameraOffOverlay } >
                                    <div className={ styles.cameraOffIcon } >
                                        <FiCameraOff />
                                    </div>

                                    <strong>
                                        Câmera desligada
                                    </strong>

                                    <span>
                                        Ative sua câmera pelos controles.
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className={styles.localControls}>
                            <button
                                type="button"
                                onClick={toggleAudio}
                                className={`${styles.smallControl} ${effectiveAudioMuted
                                        ? styles.smallControlOff
                                        : ''
                                    }`}
                                title={
                                    effectiveAudioMuted
                                        ? 'Ativar microfone'
                                        : 'Mutar microfone'
                                }
                            >
                                {effectiveAudioMuted ? (
                                    <IoMicOffSharp />
                                ) : (
                                    <IoMicSharp />
                                )}

                                <span>
                                    {effectiveAudioMuted
                                        ? 'Microfone desligado'
                                        : 'Microfone ativo'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={toggleVideo}
                                className={`${styles.smallControl} ${effectiveVideoDisabled
                                        ? styles.smallControlOff
                                        : ''
                                    }`}
                                title={
                                    effectiveVideoDisabled
                                        ? 'Ativar câmera'
                                        : 'Desativar câmera'
                                }
                            >
                                {effectiveVideoDisabled ? (
                                    <FiCameraOff />
                                ) : (
                                    <FiCamera />
                                )}

                                <span>
                                    {effectiveVideoDisabled
                                        ? 'Câmera desligada'
                                        : 'Câmera ativa'}
                                </span>
                            </button>
                        </div>
                    </section>

                    {/* =================================================
                        ANÁLISE EMOCIONAL
                    ================================================= */}

                    {isProfissional && (
                        <section className={ styles.analysisCard } >
                            <div className={ styles.analysisHeader } >
                                <div>
                                    <span className={ styles.analysisEyebrow } >
                                        ANÁLISE EMOCIONAL
                                    </span>

                                    <h2>
                                        Estado emocional
                                    </h2>
                                </div>

                                <div className={ styles.analysisIcon } >
                                    <FiActivity />
                                </div>
                            </div>

                            {analysisError ? (
                                <div className={ styles.analysisError } >
                                    <div className={ styles.analysisErrorIcon } >
                                        <FiAlertCircle />
                                    </div>

                                    <div>
                                        <strong>
                                            Análise
                                            indisponível
                                        </strong>

                                        <span>
                                            {analysisError}
                                        </span>
                                    </div>
                                </div>
                            ) : currentEmotion ? (
                                <>
                                    <div className={ styles.emotionResult } >
                                        <span className={ styles.emotionLabel } >
                                            Emoção identificada
                                        </span>

                                        <strong className={ styles.emotionName } >
                                            { currentEmotion.emocao }
                                        </strong>

                                        <div className={ styles.confidenceRow } >
                                            <div className={ styles.confidenceInfo } >
                                                <span>
                                                    Confiança da análise
                                                </span>

                                                <strong>
                                                    {Math.round( confidence )}
                                                    %
                                                </strong>
                                            </div>

                                            <div className={ styles.confidenceBar } >
                                                <div className={ styles.confidenceProgress }
                                                    style={{ width: `${confidence}%`, }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={ styles.analysisNotice } >
                                        <FiInfo />

                                        <p>
                                            A análise emocional é um recurso auxiliar e não substitui
                                            a avaliação profissional.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className={ styles.analysisWaiting } >
                                    <div className={ styles.waitingIcon } >
                                        <FiActivity />
                                    </div>

                                    <strong>
                                        Aguardando análise
                                    </strong>

                                    <span>
                                        A emoção identificada aparecerá aqui durante a sessão.
                                    </span>
                                </div>
                            )}
                        </section>
                    )}

                    {/* =================================================
                        PRIVACIDADE
                    ================================================= */}

                    {!isProfissional && (
                        <section className={ styles.privacyCard } >
                            <div className={ styles.privacyIcon } >
                                <FiShield />
                            </div>

                            <div className={ styles.privacyContent } >
                                <span>
                                    PRIVACIDADE
                                </span>

                                <h2>
                                    Ambiente protegido
                                </h2>

                                <p>
                                    Sua conversa acontece em um ambiente privado. As informações da sessão
                                    são tratadas de acordo com as regras de segurança da plataforma.
                                </p>
                            </div>
                        </section>
                    )}
                </aside>
            </main>

            {/* =====================================================
                CONTROLES FLUTUANTES
            ===================================================== */}

            <div
                className={`${styles.controlsWrapper} ${showControls
                        ? styles.controlsVisible
                        : ''
                    }`}
                onMouseEnter={() => setShowControls(true) }
                onMouseLeave={() => setShowControls(false) }
                onClick={() => setShowControls( (current) => !current ) } >
                {!showControls && (
                    <button
                        type="button"
                        className={styles.controlsTrigger }
                        aria-label="Mostrar controles da chamada"
                    >
                        <IoChevronUpOutline />
                    </button>
                )}

                <div className={styles.controlsBar}>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            toggleAudio();
                        }}
                        className={`${styles.controlButton} ${effectiveAudioMuted
                                ? styles.controlOff
                                : ''
                            }`}
                        title={
                            effectiveAudioMuted
                                ? 'Ativar áudio'
                                : 'Mutar áudio'
                        }
                    >
                        {effectiveAudioMuted ? (
                            <IoMicOffSharp />
                        ) : (
                            <IoMicSharp />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            toggleVideo();
                        }}
                        className={`${styles.controlButton} ${effectiveVideoDisabled
                                ? styles.controlOff
                                : ''
                            }`}
                        title={
                            effectiveVideoDisabled
                                ? 'Ativar câmera'
                                : 'Desativar câmera'
                        }
                    >
                        {effectiveVideoDisabled ? (
                            <FiCameraOff />
                        ) : (
                            <FiCamera />
                        )}
                    </button>

                    {isProfissional && (
                        <>
                            <div className={ styles.controlsDivider } />

                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleFinalizarSessao();
                                }}
                                className={`${styles.controlButton} ${styles.endCallButton}`}
                                title="Encerrar consulta"
                                disabled={isFinishing}
                            >
                                <IoCallOutline />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};