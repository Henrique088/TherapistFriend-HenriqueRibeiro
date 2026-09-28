// src/hooks/connection/timers/stopHeartbeatMonitor.ts

import React from "react";

export function stopHeartbeatMonitor(
    
    heartbeatTimer: React.MutableRefObject<NodeJS.Timeout | null>
) {

    if (!heartbeatTimer.current)

        return;

    clearTimeout(heartbeatTimer.current);

    heartbeatTimer.current = null;

}