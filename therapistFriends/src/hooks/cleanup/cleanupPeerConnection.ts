// src/hooks/cleanup/cleanupPeerConnection.ts

import React from "react";

export function cleanupPeerConnection(

    peerRef: React.MutableRefObject<RTCPeerConnection | null>,

    pendingIceCandidates: React.MutableRefObject<RTCIceCandidateInit[]>

) {

    if (peerRef.current) {

        peerRef.current.ontrack = null;

        peerRef.current.onicecandidate = null;

        peerRef.current.onconnectionstatechange = null;

        peerRef.current.oniceconnectionstatechange = null;

        peerRef.current.onicegatheringstatechange = null;

        peerRef.current.onsignalingstatechange = null;

        peerRef.current.close();

        peerRef.current = null;

    }

    pendingIceCandidates.current = [];

    console.log("🧹 PeerConnection removida.");

}