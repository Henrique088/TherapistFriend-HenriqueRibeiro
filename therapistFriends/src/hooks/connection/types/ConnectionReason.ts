// src/hooks/connection/reducer/ConnectionReason.ts

export enum ConnectionReason {

    HEARTBEAT = "heartbeat",

    SOCKET_DISCONNECT = "socket-disconnect",

    SOCKET_RECONNECT = "socket-reconnect",

    SERVER = "server",

    MANUAL = "manual"

}