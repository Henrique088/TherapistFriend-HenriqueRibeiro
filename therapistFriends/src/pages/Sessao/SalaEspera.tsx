// src/pages/Sessao/SalaEspera.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/apiConfig';
import { VideoSessionProvider } from '../../contexts/VideoSessionContext';
import { SessaoVideoDashboard } from './SessaoVideoDashboard';
import styles from './SalaEspera.module.css';

import { FaCamera, FaUserLock, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaLongArrowAltRight } from 'react-icons/fa';

export const SalaEspera: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [acesso, setAcesso] = useState<{ iceServers: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessaoIniciada, setSessaoIniciada] = useState(false);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const videoCallbackRef = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node && stream) {
        node.srcObject = stream;
      }
    },
    [stream]
  );

  useEffect(() => {
    const inicializarSala = async () => {
      try {
        setLoading(true);
        setErro(null);

        const response = await api.get(`/sessoes/${id}/acesso`);

        setAcesso(response.data);

        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        setStream(mediaStream);
      } catch (err: any) {
        console.error('Erro ao inicializar sala:', err);

        setErro(
          'Não foi possível acessar a câmera ou o microfone. Verifique as permissões do navegador e se os dispositivos estão disponíveis.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      inicializarSala();
    }

    return () => {
      if (!sessaoIniciada && stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [id, sessaoIniciada]);

  const toggleVideo = () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  if (sessaoIniciada && acesso && id && stream) {
    return (
      <VideoSessionProvider
        sessaoId={id}
        iceServers={acesso.iceServers}
        initialStream={stream}
      >
        <SessaoVideoDashboard />
      </VideoSessionProvider>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingIcon}>
          <FaVideo />
        </div>

        <div className={styles.loadingContent}>
          <span className={styles.loadingEyebrow}>
            THERAPISTFRIEND
          </span>

          <h1>Preparando sua consulta</h1>

          <p>
            Estamos verificando sua conexão e preparando
            câmera e microfone.
          </p>

          <div className={styles.loadingIndicator}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            TF
          </div>

          <div>
            <strong>TherapistFriend</strong>
            <span>Consulta online</span>
          </div>
        </div>

        <div className={styles.sessionInfo}>
          <span>SALA</span>
          <strong>{id?.substring(0, 8)}</strong>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.introduction}>
          <span className={styles.eyebrow}>
            ANTES DE COMEÇAR
          </span>

          <h1>
            Prepare seu ambiente
            <br />
            para a consulta.
          </h1>

          <p>
            Faça uma rápida verificação da câmera, do microfone e da conexão antes de entrar na sessão.
          </p>
        </div>

        <section className={styles.contentGrid}>
          {/* PREVIEW */}
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <div>
                <span className={styles.previewEyebrow}>
                  PRÉ-VISUALIZAÇÃO
                </span>

                <h2>Sua câmera</h2>
              </div>

              <div
                className={`${styles.statusBadge} ${
                  !isVideoEnabled ? styles.statusOff : ''
                }`}
              >
                <span className={styles.statusDot} />
                {isVideoEnabled
                  ? 'Câmera ativa'
                  : 'Câmera desligada'}
              </div>
            </div>

            <div className={styles.previewContainer}>
              <video
                ref={videoCallbackRef}
                autoPlay
                playsInline
                muted
                className={`${styles.videoFeed} ${
                  !isVideoEnabled
                    ? styles.videoDesligado
                    : ''
                }`}
              />

              {!isVideoEnabled && (
                <div className={styles.avatarPlaceholder}>
                  <div className={styles.offIcon}>
                    <FaVideoSlash />
                  </div>

                  <strong>Câmera desligada</strong>

                  <span>
                    Ative a câmera quando estiver pronto.
                  </span>
                </div>
              )}

              <div className={styles.previewControls}>
                <button
                  type="button"
                  className={`${styles.controlButton} ${
                    !isAudioEnabled
                      ? styles.controlDisabled
                      : ''
                  }`}
                  onClick={toggleAudio}
                  title={
                    isAudioEnabled
                      ? 'Mutar microfone'
                      : 'Ativar microfone'
                  }
                  disabled={!stream}
                  aria-label={
                    isAudioEnabled
                      ? 'Mutar microfone'
                      : 'Ativar microfone'
                  }
                >
                  {isAudioEnabled ? (
                    <FaMicrophone />
                  ) : (
                    <FaMicrophoneSlash />
                  )}
                </button>

                <button
                  type="button"
                  className={`${styles.controlButton} ${
                    !isVideoEnabled
                      ? styles.controlDisabled
                      : ''
                  }`}
                  onClick={toggleVideo}
                  title={
                    isVideoEnabled
                      ? 'Desligar câmera'
                      : 'Ligar câmera'
                  }
                  disabled={!stream}
                  aria-label={
                    isVideoEnabled
                      ? 'Desligar câmera'
                      : 'Ligar câmera'
                  }
                >
                  {isVideoEnabled ? (
                    <FaVideo />
                  ) : (
                    <FaVideoSlash />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.privacyNote}>
              <FaUserLock />

              <div>
                <strong>Sua privacidade é importante</strong>

                <p>
                  A pré-visualização da câmera é local e não é transmitida até você iniciar a consulta.
                </p>
              </div>
            </div>
          </div>

          {/* AÇÕES */}
          <aside className={styles.actionsSection}>
            <div className={styles.actionsCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardEyebrow}>
                  VERIFICAÇÃO
                </span>

                <h2>Está tudo pronto?</h2>

                <p>
                  Confira os itens abaixo antes de entrar na consulta.
                </p>
              </div>

              {erro && (
                <div className={styles.errorBox}>
                  <div className={styles.errorIcon}>
                    !
                  </div>

                  <div>
                    <strong>Não foi possível preparar a sala</strong>
                    <p>{erro}</p>
                  </div>
                </div>
              )}

              <div className={styles.checklist}>
                <div
                  className={`${styles.checkItem} ${
                    stream ? styles.checkItemActive : ''
                  }`}
                >
                  <div className={styles.checkIcon}>
                    <FaCamera />
                  </div>

                  <div className={styles.checkText}>
                    <span>Dispositivos</span>

                    <strong>
                      {stream
                        ? `Câmera ${
                            isVideoEnabled ? 'ativa' : 'desativada'
                          } · Microfone ${
                            isAudioEnabled ? 'ativo' : 'desativado'
                          }`
                        : 'Aguardando câmera e microfone'}
                    </strong>
                  </div>

                  <div className={styles.checkStatus}>
                    {stream ? '✓' : '—'}
                  </div>
                </div>

                <div
                  className={`${styles.checkItem} ${
                    acesso ? styles.checkItemActive : ''
                  }`}
                >
                  <div className={styles.checkIcon}>
                    <FaUserLock />
                  </div>

                  <div className={styles.checkText}>
                    <span>Conexão segura</span>

                    <strong>
                      {acesso
                        ? 'Sala pronta para conexão'
                        : 'Validando acesso à sala'}
                    </strong>
                  </div>

                  <div className={styles.checkStatus}>
                    {acesso ? '✓' : '—'}
                  </div>
                </div>
              </div>

              <div className={styles.readyMessage}>
                <span />
                <p>
                  Quando estiver pronto, você poderá entrar na consulta.
                </p>
              </div>

              <button
                type="button"
                className={styles.enterButton}
                onClick={() => setSessaoIniciada(true)}
                disabled={!stream || !acesso}
              >
                <span>
                  Iniciar consulta
                </span>

                <span className={styles.arrow}>
                  <FaLongArrowAltRight />
                </span>
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};