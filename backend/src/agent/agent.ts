import { DirectClient } from '@elizaos/client-direct';
import { AgentRuntime, elizaLogger, settings, stringToUuid, type Character } from '@elizaos/core';
import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
import { createNodePlugin } from '@elizaos/plugin-node';
import { solanaPlugin } from '@elizaos/plugin-solana';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDbCache } from './cache.js';
import { initializeClients } from './client.js';
import { getTokenForProvider, loadCharactersFromDB } from './config.js';
import { initializeDatabase } from './database.js';
import charactersModel from '../models/character.model.js';

const __filename = fileURLToPath(import.meta.url);
global.__dirname = path.dirname(__filename);
global.agentsInMemory = new Map<string, AgentRuntime>();
global.directClient = new DirectClient();
global.db = null;

let nodePlugin: any | undefined;

export function createOrReturnExistingAgent(character: Character, db: any, cache: any, token: string) {
  elizaLogger.success(elizaLogger.successesTitle, 'Creating runtime for character', character.name);

  const agentId = (character as any).agentId;

  if (global.agentsInMemory.has(agentId)) {
    elizaLogger.success(elizaLogger.successesTitle, 'Returning cached runtime for character', character.name);
    return global.agentsInMemory.get(agentId)!;
  }

  nodePlugin ??= createNodePlugin();

  const runtime = new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [bootstrapPlugin, nodePlugin, character.settings?.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });

  global.agentsInMemory[agentId] = runtime;
  global.agentsInMemory.set(agentId, runtime);
  return runtime;
}

export const startAgent = async (character: Character, directClient: DirectClient) => {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);
    const dataDir = path.join(global.__dirname, '../data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    global.db = initializeDatabase(dataDir);

    await global.db.init();

    const cache = initializeDbCache(character, global.db);
    createOrReturnExistingAgent(character, global.db, cache, token);

    const agentId = (character as any).agentId;
    const runtime: AgentRuntime = global.agentsInMemory.get(agentId);

    await runtime.initialize();

    runtime.clients = await initializeClients(character, runtime);

    directClient.registerAgent(runtime);

    // report to console
    elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

    return runtime;
  } catch (error) {
    elizaLogger.error(`Error starting agent for character ${character.name}:`, error);
    console.error(error);
    throw error;
  }
};

export const startAgents = async () => {
  const serverPort = parseInt(settings.SERVER_PORT || '3000');

  const charactersDB = await charactersModel.find({}).lean();
  const characters = await loadCharactersFromDB(charactersDB);

  try {
    for (const character of characters) {
      if ((character as any).status === 'on') {
        await startAgent(character, global.directClient as DirectClient);
      }
    }
  } catch (error) {
    elizaLogger.error('Error starting agents:', error);
  }

  // upload some agent functionality into directClient
  global.directClient.startAgent = async (character: Character) => {
    // wrap it so we don't have to inject directClient later
    return startAgent(character, global.directClient);
  };

  global.directClient.start(serverPort + 1);

  // elizaLogger.log("Chat started. Type 'exit' to quit.");
  // const chat = startChat(characters);
  // chat();

  // await sendTweet();
};
