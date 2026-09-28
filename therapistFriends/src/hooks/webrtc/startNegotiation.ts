import { Socket } from "socket.io-client";

interface Params {

    peer: RTCPeerConnection;

    signalingSocket: Socket;

    sessaoId: string;

}

export async function startNegotiation({ peer, signalingSocket, sessaoId }: Params): Promise<void> {

    console.log( "📡 Criando Offer..." );

    const offer = await peer.createOffer();

    await peer.setLocalDescription( offer );

    signalingSocket.emit( "offer", { sessaoId, offer } );

    console.log( "✅ Offer enviada." );

}