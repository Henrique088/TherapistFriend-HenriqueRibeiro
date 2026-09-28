// src/hooks/connection/types/ConnectionState.ts

import { ConnectionStatus } from "./ConnectionStatus";

import { ConnectionReason } from "./ConnectionReason";

export interface ConnectionState {

    status: ConnectionStatus;

    reason?: ConnectionReason;

    reconnectCountdown: number;

    remoteOnline: boolean;

}

export const initialConnectionState: ConnectionState = {

    status: ConnectionStatus.CONNECTED,

    reconnectCountdown: 0,

    remoteOnline: true

};