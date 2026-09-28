import  EventDispatcher  from "../../domain/@shared/events/EventDispatcher";
import { ISessionRuntimeService } from "../../domain/services/ISessionRuntimeService";

export class PresenceScheduler {

    private interval: NodeJS.Timeout | null = null;

    constructor(

        private readonly runtime: ISessionRuntimeService,

        private readonly dispatcher: EventDispatcher

    ) {}

    start(): void {

        if (this.interval)
            return;

        this.interval = setInterval(

            () => this.check(),

            5000

        );

    }

    stop(): void {

        if (!this.interval)
            return;

        clearInterval(this.interval);

        this.interval = null;

    }

    private async check(): Promise<void> {

    }

}