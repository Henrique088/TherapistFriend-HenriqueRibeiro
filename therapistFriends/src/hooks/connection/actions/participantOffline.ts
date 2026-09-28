// src/hooks/connection/actions/participantOffline.ts

import React from "react";

import { ConnectionAction, ConnectionActionTypes, ConnectionReason } from "../types";

import { startReconnectCountdown } from "../timers";

interface ParticipantOfflineParams {

    dispatch: React.Dispatch<ConnectionAction>;

    reconnectTimer: React.MutableRefObject<NodeJS.Timeout | null>;

    onReconnectTimeout?(): void;

}

export function participantOffline({

    dispatch,

    reconnectTimer,

    onReconnectTimeout

}: ParticipantOfflineParams): void {

    dispatch({ type: ConnectionActionTypes.SET_RECONNECTING, reason: ConnectionReason.HEARTBEAT });

    startReconnectCountdown({ reconnectTimer, dispatch, reason: ConnectionReason.HEARTBEAT, onReconnectTimeout });

}