// src/hooks/connection/actions/participantOnline.ts

import React from "react";

import { ConnectionAction, ConnectionActionTypes } from "../types";

import { stopReconnectCountdown } from "../timers";

interface ParticipantOnlineParams {

    dispatch: React.Dispatch<ConnectionAction>;

    reconnectTimer: React.MutableRefObject<NodeJS.Timeout | null>;

}

export function participantOnline({

    dispatch,

    reconnectTimer

}: ParticipantOnlineParams): void {

    stopReconnectCountdown( reconnectTimer );

    dispatch({ type: ConnectionActionTypes.SET_CONNECTED });

}