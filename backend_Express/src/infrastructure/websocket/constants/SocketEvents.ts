// src/infrastructure/websocket/constants/SocketEvents.ts

export const SocketEvents = {

    Connection: "connection",

    Disconnect: "disconnect",

    JoinSession: "join-session",

    Heartbeat: "heartbeat",

    RoomReady: "room-ready",

    Offer: "offer",

    Answer: "answer",

    IceCandidate: "ice-candidate",

    EndSession: "end-session",

    SessionEnded: "session-ended",

    SessionTimeout: "session-timeout",

    ParticipantOffline: "participant-offline",

    ParticipantOnline: "participant-online",

    CheckRoomStatus: "check-room-status",

    RoomStatus: "room-status"

} as const;