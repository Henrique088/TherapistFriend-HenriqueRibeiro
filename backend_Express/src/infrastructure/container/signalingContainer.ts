// src/infrastructure/container/signalingContainer.ts

import { Namespace } from "socket.io";
import { SignalingService } from "../websocket/signaling/SignalingService";
import AppError from "../../application/errors/AppError";

let signalingService: SignalingService;

export function setupSignalingContainer( namespace: Namespace ) {
    
    signalingService = new SignalingService(namespace);
}

export function getSignalingService(): SignalingService {

    if (!signalingService) {
        
        throw new AppError("SignalingService não inicializado.");
    }

    return signalingService;
}