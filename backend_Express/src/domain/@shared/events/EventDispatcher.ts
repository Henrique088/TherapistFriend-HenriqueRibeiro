// src/domain/@shared/events/EventDispatcher.ts

import { DomainEventInterface } from "./DomainEventInterface";
import { EventHandlerInterface } from "./EventHandlerInterface";

export interface EventDispatcherInterface {

    notify(event: DomainEventInterface): void;

    register(eventName: string, eventHandler: EventHandlerInterface): void;

    unregister(eventName: string, eventHandler: EventHandlerInterface): void;

    unregisterAll(): void;
}

export default class EventDispatcher implements EventDispatcherInterface {

    private eventHandlers: { [eventName: string]: EventHandlerInterface[] } = {};

    get getEventHandlers(): { [eventName: string]: EventHandlerInterface[] } {

        return this.eventHandlers;
    }

    register(eventName: string, eventHandler: EventHandlerInterface): void {

        if (!this.eventHandlers[eventName]) {

            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(eventHandler);
    }

    unregister(eventName: string, eventHandler: EventHandlerInterface): void {

        if (this.eventHandlers[eventName]) {

            const index = this.eventHandlers[eventName].indexOf(eventHandler);

            if (index !== -1) {

                this.eventHandlers[eventName].splice(index, 1);
            }
        }
    }

    unregisterAll(): void { 
        
        this.eventHandlers = {};
    }

    notify(event: DomainEventInterface): void {
        // console.log("Evento recebido:", event.constructor.name);

        // console.log("Handlers registrados:", Object.keys(this.eventHandlers));

        // console.log("Handlers encontrados:", this.eventHandlers[event.constructor.name]);
        const eventName = event.constructor.name;

        if (this.eventHandlers[eventName]) {

            this.eventHandlers[eventName].forEach((eventHandler) => {
                
                eventHandler.handle(event);
            });
        }
    }
}