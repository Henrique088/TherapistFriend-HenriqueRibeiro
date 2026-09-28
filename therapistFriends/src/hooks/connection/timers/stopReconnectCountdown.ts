// src/hooks/connection/timers/stopReconnectCountdown.ts

import React from "react";

export function stopReconnectCountdown(
    
    reconnectTimer: React.MutableRefObject<NodeJS.Timeout | null>
) {

    if (!reconnectTimer.current)
        return;

    clearInterval(reconnectTimer.current);

    reconnectTimer.current = null;

}