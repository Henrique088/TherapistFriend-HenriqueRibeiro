// src/Components/Video/RemoteVideoArea.tsx

import React from 'react';

import { VideoPlayer } from './VideoPlayer';

import {
  ConnectionState,
  ConnectionStatus,
} from '../../hooks/connection/types';

import styles from './RemoteVideoArea.module.css';


interface RemoteVideoAreaProps {
  remoteStream: MediaStream | null;

  isCallStarted: boolean;

  isProfissional: boolean;

  isParticipantOnline: boolean;

  connectionState: ConnectionState;
}


export function RemoteVideoArea({
  remoteStream,
  isCallStarted,
  isProfissional,
  isParticipantOnline,
  connectionState,
}: RemoteVideoAreaProps) {


  /* =====================================================
     VERIFICA SE O STREAM POSSUI FAIXAS ATIVAS
     ===================================================== */

  const hasActiveTracks = Boolean(
    remoteStream &&
    remoteStream.getTracks().length > 0 &&
    remoteStream
      .getTracks()
      .some((track) => track.readyState === 'live')
  );


  /* =====================================================
     TIMEOUT
     ===================================================== */

  if (
    connectionState.status === ConnectionStatus.TIMEOUT
  ) {
    return (
      <div className={styles.container}>

        <div className={styles.statusIcon}>
          <span className={styles.statusIconLine} />
        </div>

        <h2 className={styles.title}>
          Sessão encerrada
        </h2>

        <p className={styles.description}>
          O tempo máximo de reconexão foi atingido.
        </p>

        <p className={styles.redirectText}>
          Redirecionando...
        </p>

      </div>
    );
  }


  /* =====================================================
     RECONEXÃO
     ===================================================== */

  if (
    connectionState.status ===
    ConnectionStatus.RECONNECTING
  ) {
    return (
      <div className={styles.container}>

        <div className={styles.loader} />

        <h3 className={styles.title}>
          Participante desconectado
        </h3>

        <p className={styles.description}>
          Aguardando reconexão...
        </p>

      </div>
    );
  }


  /* =====================================================
     SESSÃO AINDA NÃO INICIOU
     ===================================================== */

  if (!isCallStarted) {
    return (
      <div className={styles.container}>

        <div className={styles.loader} />

        <p className={styles.description}>
          {isProfissional
            ? 'Aguardando o paciente conectar...'
            : 'Aguardando o profissional iniciar a chamada...'}
        </p>

      </div>
    );
  }


  /* =====================================================
     PARTICIPANTE DESCONECTADO
     ===================================================== */

  if (!isParticipantOnline) {
    return (
      <div className={styles.container}>

        <div className={styles.loader} />

        <p className={styles.description}>
          {isProfissional
            ? 'Aguardando o paciente conectar...'
            : 'Aguardando o profissional conectar...'}
        </p>

      </div>
    );
  }


  /* =====================================================
     STREAM REMOTO PRONTO
     ===================================================== */

  if (hasActiveTracks && remoteStream) {
    return (
      <VideoPlayer
        stream={remoteStream}
      />
    );
  }


  /* =====================================================
     NEGOCIAÇÃO / AGUARDANDO TRACKS
     ===================================================== */

  return (
    <div className={styles.container}>

      <div className={styles.loader} />

      <p className={styles.description}>
        Conectando participante...
      </p>

    </div>
  );
}