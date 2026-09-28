// src/application/services/IQueueService.ts

// interface para opções da fila
export interface QueueOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
}

export interface ScheduleJobOptions {

    every: number;

}

// interface da fila
export interface IQueueService {
  addJob(
    queueName: string, 
    jobName: string, 
    data: any, 
    options?: QueueOptions // Parâmetro opcional de configuração
  ): Promise<void>;

  scheduleJob(

        queueName: string,

        jobName: string,

        data: any,

        options: ScheduleJobOptions

    ): Promise<void>;
}