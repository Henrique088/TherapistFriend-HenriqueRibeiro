// src/hooks/connection/actions/heartbeatReceived.ts

import React from "react";

import { startHeartbeatMonitor, stopHeartbeatMonitor } from "../timers";

interface HeartbeatReceivedParams {

    heartbeatTimer: React.MutableRefObject<NodeJS.Timeout | null>;

    participantOffline(): void;

}

export function heartbeatReceived({

    heartbeatTimer,

    participantOffline

}: HeartbeatReceivedParams): void {

    stopHeartbeatMonitor( heartbeatTimer );

    startHeartbeatMonitor({ heartbeatTimer, participantOffline });

}