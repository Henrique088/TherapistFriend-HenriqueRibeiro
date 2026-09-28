// src/hooks/connection/timers/startReconnectCountdown.ts

import React from "react";

import { ConnectionAction, ConnectionActionTypes, ConnectionReason } from "../types";

import { stopReconnectCountdown } from "../timers";

interface StartReconnectCountdownParams {

    reconnectTimer: React.MutableRefObject<NodeJS.Timeout | null>;

    dispatch: React.Dispatch<ConnectionAction>;

    reason: ConnectionReason;

    onReconnectTimeout?(): void;

    duration?: number;

}

export function startReconnectCountdown({

    reconnectTimer,

    dispatch,

    reason,

    onReconnectTimeout,

    duration = 30

}: StartReconnectCountdownParams): void {

    stopReconnectCountdown( reconnectTimer );

    let seconds = duration;

    dispatch({ type: ConnectionActionTypes.SET_COUNTDOWN, value: seconds });

    reconnectTimer.current = setInterval(() => {

        seconds--;

        dispatch({

            type: ConnectionActionTypes.SET_COUNTDOWN,

            value: seconds

        });

        if (seconds > 0)
            return;

        stopReconnectCountdown( reconnectTimer );

        dispatch({ type: ConnectionActionTypes.SET_TIMEOUT, reason });

        onReconnectTimeout?.();

    }, 1000);

}