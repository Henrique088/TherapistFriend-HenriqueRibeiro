// src/hooks/cleanup/resetSessionState.ts

import React from "react";

interface Props {

    setLocalStream: React.Dispatch< React.SetStateAction<MediaStream | null> >;

    setIsCallStarted: React.Dispatch< React.SetStateAction<boolean> >;

    resetMediaControls: () => void;

}

export function resetSessionState({

    setLocalStream,

    setIsCallStarted,

    resetMediaControls

}: Props) {

    setLocalStream(null);

    setIsCallStarted(false);

    resetMediaControls();

    console.log("♻️ Estados da sessão redefinidos.");

}