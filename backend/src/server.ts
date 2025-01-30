import { App } from './app.js';
import { AgentRoute } from './routes/agent.route.js';

const app = new App([new AgentRoute()]);

app.listen();
