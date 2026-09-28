// src/application/services/index.ts

import { redisClient } from "../../infrastructure/container/redisContainer";
import {TokenService} from "./TokenService";
import {SessionRuntimeService} from "./SessionRuntimeService";

const tokenService = new TokenService();
const sessionRuntimeService = new SessionRuntimeService(redisClient);

export { tokenService, sessionRuntimeService };



