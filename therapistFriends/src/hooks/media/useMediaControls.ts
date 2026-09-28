// src/hooks/media/useMediaControls.ts

import { useCallback, useState } from "react";

interface Props {

    localStream: MediaStream | null;
}

export function useMediaControls({ localStream }: Props) {

    const [ isAudioMuted, setIsAudioMuted ] = useState(false);

    const [ isVideoDisabled, setIsVideoDisabled ] = useState(false);

    const toggleAudio = useCallback(() => {

        if (!localStream)
            return;

        localStream.getAudioTracks().forEach(track => {

                track.enabled = !track.enabled;
        });

        setIsAudioMuted( value => !value );
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (!localStream)
            return;

        localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
        });

        setIsVideoDisabled( value => !value );

    }, [localStream]);

    const resetMediaControls = useCallback(() => {

        setIsAudioMuted(false);

        setIsVideoDisabled(false);

    }, []);

    return {
        
        toggleAudio,

        toggleVideo,

        isAudioMuted,

        isVideoDisabled,

        resetMediaControls
    };

}