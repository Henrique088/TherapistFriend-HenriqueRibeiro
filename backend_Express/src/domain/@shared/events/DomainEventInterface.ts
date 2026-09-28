// src/domain/@shared/events/DomainEventInterface.ts

export interface DomainEventInterface<T = any> {
    dateTimeOccurred: Date;
    eventData: T;
}