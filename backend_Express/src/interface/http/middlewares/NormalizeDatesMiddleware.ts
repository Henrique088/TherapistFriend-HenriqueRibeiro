// // src/infrastructure/http/middlewares/NormalizeDatesMiddleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { DataHandler } from '../../../application/utils/DataHandler';

// export const normalizeAllDates = (req: Request, res: Response, next: NextFunction) => {
//     const processObject = (obj: any) => {

//         console.log("obj:", obj);
//         if (!obj || typeof obj !== 'object') return;

//         Object.keys(obj).forEach(key => {
//             const value = obj[key];

//             // 1. Se a chave termina com 'Data', 'Inicio', 'Fim' ou 'Excecao'
//             const isDateKey = /data|inicio|fim|excecao/i.test(key);

//             // 2. E o valor parece uma string de data (YYYY-MM-DD...)
//             if (isDateKey && typeof value === 'string' && value.length >= 10) {
//                 obj[key] = DataHandler.parseLocalDate(value);
//             } 
//             // 3. Recursividade para objetos aninhados
//             else if (typeof value === 'object') {
//                 processObject(value);
//             }
//         });
//     };

//     processObject(req.body);
//     processObject(req.query);
//     processObject(req.params);

//     next();
// };



