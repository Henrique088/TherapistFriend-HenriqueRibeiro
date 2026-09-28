// src/domain/@shared/events/EventHandlerInterface.ts

import { DomainEventInterface } from "./DomainEventInterface";

export interface EventHandlerInterface<T extends DomainEventInterface = DomainEventInterface> {
    
    handle(event: T): void;
}