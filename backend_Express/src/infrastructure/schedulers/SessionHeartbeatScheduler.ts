// src/infrastructure/schedulers/SessionHeartbeatScheduler.ts

import { VerificarTimeoutSessaoUseCase } from "../../application/use-cases/sessao/VerificarTimeoutSessaoUseCase";


export class SessionHeartbeatScheduler {

    constructor(

        private readonly verificarTimeoutSessaoUseCase: VerificarTimeoutSessaoUseCase

    ) {}

    start() {

        setInterval(async () => {

            try {

                await this.verificarTimeoutSessaoUseCase.execute();

            } catch (error) {

                console.error(error);

            }

        }, 5000);

    }

}