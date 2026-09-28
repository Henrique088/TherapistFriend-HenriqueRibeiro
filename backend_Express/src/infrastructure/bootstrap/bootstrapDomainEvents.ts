// src/infrastructure/bootstrap/bootstrapDomainEvents.ts

import { Server } from "socket.io";

import { setupDomainEvents } from "../container/eventContainer";

import { encerrarSessaoUseCase } from "../container/useCaseContainer";

// Criado para evitar dependência circular entre o container de eventos e o container de casos de uso
export function bootstrapDomainEvents(io: Server): void {

    setupDomainEvents(io, { encerrarSessaoUseCase });

}