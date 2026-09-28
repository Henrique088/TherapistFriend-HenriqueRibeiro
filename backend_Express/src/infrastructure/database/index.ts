// src/infrastructure/database/index.ts 

import * as fs from 'fs';

import * as path from 'path';
import { Sequelize, Model, ModelStatic } from 'sequelize'; 

// 1. INTERFACE 
interface DBType {
    sequelize: Sequelize;
    Sequelize: typeof Sequelize;
    
    
    // Garante que todos os Models que serão anexados tenham o tipo correto.
    [key: string]: ModelStatic<Model<any, any>> | Sequelize | typeof Sequelize | any; 
    // Uso do 'any' no final para Models que podem não ter a tipagem completa
}

const basename = path.basename(__filename);

// 2. Inicializa o objeto DB tipado
const db: DBType = {} as DBType; 

// 3. Configuração do Sequelize (Ajustado para ler do process.env)
const sequelize = new Sequelize(
    process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/dbname',
    {
        dialect: 'postgres',
        logging: false,
        timezone: '+00:00', 
        dialectOptions: {
            useUTC: true, 
        },
       
    }
);

// 4. Carregar todos os Models
const modelsDir = path.join(__dirname, 'models');

fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .forEach(file => {
        const modelModule = require(path.join(modelsDir, file));
        
    
        const modelFactory = modelModule.default;
        
        if (typeof modelFactory === 'function') {
            const model = modelFactory(sequelize);
            
        
            db[model.name] = model; 
            // console.log(`Model registrado no DB: ${model.name}`);
        }
    });

// 5. Associações
Object.keys(db).forEach(modelName => {
    
    if ((db[modelName] as any).associate) { 
        (db[modelName] as any).associate(db);
    }
});

// 6. ATRIBUIÇÕES FINAL
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 7. Exportação
export default db;