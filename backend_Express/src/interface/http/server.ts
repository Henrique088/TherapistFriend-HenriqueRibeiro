// src/interface/http/server.ts

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler';
import routes from '../../interface/http/routes';
import { setupBullBoard } from '../../infrastructure/container/bullBoardContainer'; 


import db from '../../infrastructure/database/index';

const app: Express = express();

// Middlewares...
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//     origin: process.env.NODE_ENV === 'development'
//         ? process.env.FRONTEND_URL || 'http://localhost:3000'
//         : process.env.FRONTEND_URL,
//     credentials: true,
// }));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.15.135:3000',
    'https://hemolytic-bulgingly-kendall.ngrok-free.dev'
  ],
  credentials: true
}));

setupBullBoard(app);

// Rotas
app.use('/', routes);

app.use(errorHandler);


// Exporta o db que veio da infraestrutura
export { app, db };