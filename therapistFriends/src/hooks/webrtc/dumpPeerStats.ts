// src/hooks/webrtc/dumpPeerStats.ts

export async function dumpPeerStats( peer: RTCPeerConnection): Promise<void> {

    console.log("========== WEBRTC STATS ==========");

    const stats = await peer.getStats();

    stats.forEach(report => {

        switch (report.type) {

            case "local-candidate":

                console.log("📍 LOCAL CANDIDATE", report );

                break;

            case "remote-candidate":

                console.log( "🌎 REMOTE CANDIDATE", report );

                break;

            case "candidate-pair":

                if ( (report as RTCIceCandidatePairStats).state === "succeeded") {

                    console.log("✅ ACTIVE PAIR", report );

                }

                break;

            case "transport":

                console.log( "🚚 TRANSPORT", report );

                break;
        }

    });

}