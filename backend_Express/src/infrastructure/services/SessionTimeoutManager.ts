// src/infrastructure/services/SessionTimeoutManager.ts

interface ScheduleParams {

    sessaoId: string;

    onTimeout: () => Promise<void>;

}

export class SessionTimeoutManager {

    /**
     * Timeout ativo por sessão.
     */
    private readonly timeouts = new Map<string, NodeJS.Timeout>();

    /**
     * Tempo permitido para reconexão.
     */
    constructor(

        private readonly reconnectTimeout = 60_000

    ) { }

    /**
     * Agenda encerramento automático.
     */
    schedule({ sessaoId, onTimeout }: ScheduleParams): void {

        if (this.timeouts.has(sessaoId)) {

            return;

        }

        console.log( `⏳ Timeout iniciado para sessão ${sessaoId}` );

        const timeout = setTimeout(async () => {

            this.timeouts.delete(sessaoId);

            console.log( `⌛ Tempo esgotado para sessão ${sessaoId}` );

            try {

                await onTimeout();

            } catch (err) {

                console.error( "[SessionTimeout]", err );

            }

        }, this.reconnectTimeout);

        this.timeouts.set( sessaoId, timeout );

    }

    /**
     * Cancela timeout quando alguém reconecta.
     */
    cancel( sessaoId: string ): void {

        const timeout = this.timeouts.get(sessaoId);

        if (!timeout) {

            return;

        }

        clearTimeout(timeout);

        this.timeouts.delete(sessaoId);

        console.log( `✅ Timeout cancelado (${sessaoId})` );

    }

    /**
     * Alias para cancel().
     */
    clear( sessaoId: string ): void {

        this.cancel(sessaoId);

    }

    /**
     * Verifica se existe timeout ativo.
     */
    has( sessaoId: string ): boolean {

        return this.timeouts.has( sessaoId );

    }

}