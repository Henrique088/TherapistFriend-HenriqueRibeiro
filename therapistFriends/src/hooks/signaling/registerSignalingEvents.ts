// src/hooks/signaling/registerSignalingEvents.ts

import { Socket } from "socket.io-client";

import { handleIceCandidate } from "./handlers/handleIceCandidate";
import { handleAnswer } from "./handlers/handleAnswer";
import { handleOffer } from "./handlers/handleOffer";
import { handleSessionEnded } from "./handlers/handleSessionEnded";
import { handleRoomReady } from "./handlers/handleRoomReady";

interface RegisterSignalingEventsParams {

    socket: Socket;

    sessaoId: string;

    isProfissional: boolean;

    localStream: MediaStream | null;

    setLocalStream: (stream: MediaStream) => void;

    initWebRTC: (stream: MediaStream) => Promise<RTCPeerConnection>;

    startAnalysis: (stream: MediaStream) => void;

    startCall: () => Promise<void>;

    peerRef: React.MutableRefObject<RTCPeerConnection | null>;

    pendingIceCandidates: React.MutableRefObject<RTCIceCandidateInit[]>;

    participantOffline(): void;

    participantOnline(): void;

    sessionTimeout?(): void;

}

export function registerSignalingEvents( params: RegisterSignalingEventsParams ) {

    const {

        socket,

        peerRef,

        pendingIceCandidates

    } = params;

    socket.on("offer", ({ offer }) => {

        console.log("📩 OFFER RECEBIDA", peerRef.current?.signalingState);

        handleOffer({ ...params, offer });

    });

    socket.on("answer", ({ answer }) => handleAnswer(
        answer,

        peerRef,

        pendingIceCandidates)
    );

    socket.on("ice-candidate", ({ candidate }) => handleIceCandidate(

        {candidate,

        peerRef,

        pendingIceCandidates}

    )
    );

    socket.on("room-ready", ({ shouldCreateOffer }) => handleRoomReady(

        shouldCreateOffer,

        params.startCall

    )
    );

    socket.on(

        "participant-offline",

        () => params.participantOffline()

    );

    socket.on(

        "participant-online",

        () => params.participantOnline()

    );

    socket.on(

        "session-timeout",

        () => params.sessionTimeout?.()

    );

    socket.on("session-ended", handleSessionEnded);

    console.log("📡 Eventos de signaling registrados.");

    return () => {

        socket.off("offer");

        socket.off("answer");

        socket.off("ice-candidate");

        socket.off("room-ready");

        socket.off("session-ended");

        socket.off("participant-offline");

        socket.off("participant-online");

        socket.off("session-timeout");

        console.log("🧹 Eventos de signaling removidos.");
    };

}