// src/interface/http/routes/mood.factory.ts


import { MoodController } from "../../interface/controllers/MoodController";

import { gerarCardsPorMoodUseCase, registrarMoodUseCase } from "../../infrastructure/container/useCaseContainer";

export const makeRegistrarMoodUseCase = (): MoodController => {

    return new MoodController(registrarMoodUseCase, gerarCardsPorMoodUseCase);
}
