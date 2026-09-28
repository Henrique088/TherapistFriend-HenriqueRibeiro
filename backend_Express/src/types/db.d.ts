// src/types/db.d.ts

import { Sequelize } from 'sequelize';

// Definição da interface para o objeto 'db' exportado
export interface IDatabase {
    sequelize: Sequelize; // A instância principal do Sequelize

    [key: string]: any; // Permite outros objetos/models a serem anexados
}