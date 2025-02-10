import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller.js';
import { logger } from '../utils/logger.js';

export interface Routes {
  path?: string;
  router: Router;
}

export class AgentRoute implements Routes {
  public path = '/api';
  public router: Router;
  public agentController = new AgentController();

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    logger.debug('Route has been initialized!');

    this.router.get(`/`, (req, res) => {
      res.status(200).json({
        message: 'Hello World!',
      });
    });

    this.router.get(`${this.path}/getAllAgents`, this.agentController.getAllAgents);
    this.router.post(`${this.path}/restartAgent`, this.agentController.restartAgent);
    this.router.post(`${this.path}/toggleAgent`, this.agentController.toggleAgent);
    this.router.post(`${this.path}/updateAgentCharacter`, this.agentController.updateAgentCharacter);
    this.router.post(`${this.path}/createRoom`, this.agentController.createRoom);
    this.router.post(`${this.path}/guessWord`, this.agentController.guessWord);
    this.router.post(`${this.path}/reply`, this.agentController.reply);
    this.router.post(`${this.path}/gameInfo`, this.agentController.gameInfo);
    this.router.post(`${this.path}/playWithUser`, this.agentController.playWithUser);
  }
}
