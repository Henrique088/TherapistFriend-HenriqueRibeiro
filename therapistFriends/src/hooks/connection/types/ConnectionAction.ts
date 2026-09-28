// src/hooks/connection/types/ConnectionAction.ts

import { ConnectionReason } from "./ConnectionReason";

import { ConnectionActionTypes } from "./ConnectionActionTypes";

export type ConnectionAction =

    | {

        type: ConnectionActionTypes.SET_RECONNECTING;

        reason: ConnectionReason;

    }

    | {

        type: ConnectionActionTypes.SET_CONNECTED;

    }

    | {

        type: ConnectionActionTypes.SET_TIMEOUT;

        reason: ConnectionReason;

    }

    | {

        type: ConnectionActionTypes.SET_COUNTDOWN;

        value: number;

    }

    | {

        type: ConnectionActionTypes.RESET;

    };