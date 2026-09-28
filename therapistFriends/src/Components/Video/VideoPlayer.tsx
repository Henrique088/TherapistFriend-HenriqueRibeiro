// src/components/Video/VideoPlayer.tsx

import React, { useEffect, useRef } from 'react';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  muted?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  isLocal = false,
  muted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;

    if (!videoEl || !stream) {
      return;
    }

    videoEl.srcObject = stream;

    const playVideo = () => {
      if (videoEl.paused) {
        videoEl.play().catch((err) => {
          console.warn(
            'Autoplay bloqueado pelo navegador ou mídia não pronta:',
            err
          );
        });
      }
    };

    playVideo();

    // Trata a chegada ou remoção assíncrona de faixas
    stream.addEventListener('addtrack', playVideo);
    stream.addEventListener('removetrack', playVideo);

    return () => {
      stream.removeEventListener('addtrack', playVideo);
      stream.removeEventListener('removetrack', playVideo);
    };
  }, [stream]);

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted || isLocal}
        className={`${styles.video} ${
          isLocal ? styles.local : ''
        }`}
      />
    </div>
  );
};