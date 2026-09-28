// // src/inrasctructure/container/serviceContainer.ts

import { TurnCredentialService } from "../../application/services/TurnCredentialService";
import { redisClient } from "./redisContainer";
import { CriptografiaService } from "../services/CriptografiaService";


export const turnCredentialService =
    new TurnCredentialService({

        host:
            process.env.TURN_SERVER_HOST!,

        port:
            Number(process.env.TURN_SERVER_PORT),

        secret:
            process.env.TURN_SECRET!,

        ttl:
            600

    }, redisClient);


export const criptografiaService = new CriptografiaService()