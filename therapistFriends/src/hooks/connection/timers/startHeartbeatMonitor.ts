// src/hooks/connection/timers/startHeartbeatMonitor.ts

import React from "react";

import { stopHeartbeatMonitor } from "./stopHeartbeatMonitor";

interface Params {

    heartbeatTimer: React.MutableRefObject<NodeJS.Timeout | null>;

    participantOffline(): void;

}

export function startHeartbeatMonitor({ heartbeatTimer, participantOffline }: Params) {

    stopHeartbeatMonitor(heartbeatTimer);

    heartbeatTimer.current = setTimeout(() => {

        participantOffline();

    }, 35000);

}