import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { env } from './config/config.js';
import { Routes } from './routes/agent.route.js';
import { ErrorMiddleware } from './middlewares/error.middleware.js';
import { logger, stream } from './utils/logger.js';
import { startAgents } from './agent/agent.js';
import './database/mongo.js';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = env.NODE_ENV || 'development';
    this.port = env.SERVER_PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });

    startAgents()
      .then(() => {
        logger.info('Agent start call initiated!');
      })
      .catch(e => {
        logger.error('Error while initializing agents ' + e.toString());
        process.exit(1);
      });

    process.on('uncaughtException', error => {
      console.error('Uncaught Exception:', error);
      process.exit(1); // Exit the process with a failure code
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1); // Exit the process with a failure code
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan('dev', { stream }));
    this.app.use(cors({ origin: '*', credentials: true }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
