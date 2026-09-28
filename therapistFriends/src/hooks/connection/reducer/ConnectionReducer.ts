// src/hooks/connection/reducer/ConnectionReducer.ts

import { ConnectionAction, ConnectionActionTypes, ConnectionState, ConnectionStatus, initialConnectionState } from "../types";

export function connectionReducer(

    state: ConnectionState,

    action: ConnectionAction

): ConnectionState {

    switch (action.type) {

        case ConnectionActionTypes.SET_RECONNECTING:

            return {

                ...state,

                status: ConnectionStatus.RECONNECTING,

                remoteOnline: false,

                reason: action.reason

            };

        case ConnectionActionTypes.SET_CONNECTED:

            return {

                ...state,

                status: ConnectionStatus.CONNECTED,

                remoteOnline: true,

                reconnectCountdown: 0,

                reason: undefined

            };

        case ConnectionActionTypes.SET_TIMEOUT:

            return {

                ...state,

                status: ConnectionStatus.TIMEOUT,

                reconnectCountdown: 0,

                remoteOnline: false,

                reason: action.reason

            };

        case ConnectionActionTypes.SET_COUNTDOWN:

            return {

                ...state,

                reconnectCountdown: action.value

            };

        case ConnectionActionTypes.RESET:

            return initialConnectionState;

        default:

            return state;

    }

}