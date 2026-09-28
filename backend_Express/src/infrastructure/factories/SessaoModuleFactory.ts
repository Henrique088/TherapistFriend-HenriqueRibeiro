// src/infrastructure/factories/SessaoModuleFactory.ts

import { Namespace } from "socket.io";
import { SignalingController } from "../websocket/controller/SignalingController";
import { encerrarSessaoUseCase, entrarSessaoUseCase, iniciarSessaoUseCase, participanteOfflineUseCase, registrarPresencaSessaoUseCase } from "../container/useCaseContainer";
import { SessaoSignalingGateway } from "../websocket/gateways/SessaoSignalingGateway";
import { getSignalingService } from "../container/signalingContainer";
import { sessionRuntimeService } from "../../application/services";


export class SessaoModuleFactory {

    static create(namespace: Namespace) {


        const controller =

            new SignalingController(

                getSignalingService(),

                sessionRuntimeService,

                entrarSessaoUseCase,

                iniciarSessaoUseCase,

                encerrarSessaoUseCase,

                registrarPresencaSessaoUseCase,

                participanteOfflineUseCase

            );

        return new SessaoSignalingGateway(

            namespace,

            controller

        );

    }

}