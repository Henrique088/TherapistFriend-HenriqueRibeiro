// src/hooks/connection/actions/resetConnection.ts

import React from "react";

import { ConnectionAction, ConnectionActionTypes } from "../types";

import { stopHeartbeatMonitor, stopReconnectCountdown } from "../timers";

interface ResetConnectionParams {

    dispatch: React.Dispatch<ConnectionAction>;

    reconnectTimer: React.MutableRefObject<NodeJS.Timeout | null>;

    heartbeatTimer: React.MutableRefObject<NodeJS.Timeout | null>;

}

export function resetConnection({

    dispatch,

    reconnectTimer,

    heartbeatTimer

}: ResetConnectionParams): void {

    stopReconnectCountdown( reconnectTimer );

    stopHeartbeatMonitor( heartbeatTimer );

    dispatch({ type: ConnectionActionTypes.RESET });

}