// src/infrastructure/container/queueContainer.ts

import { bullMQService } from "./bullMQContainer";

import { registerSchedulers } from "../queue/registerSchedulers";

registerSchedulers(bullMQService);