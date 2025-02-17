import {
  AgentRuntime,
  Content,
  DatabaseAdapter,
  generateText,
  Memory,
  ModelClass,
} from '@elizaos/core';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { startAgent } from '../agent/agent.js';
import charactersModel from '../models/character.model.js';
import userModel from '../models/user.model.js';
import { randomWordPicker } from '../utils/util.js';
import { upgradeDynamicNft } from '../services/sui.service.js';

export class AgentController {
  public getAllAgents = async (req: Request, res: Response) => {
    try {
      const agentsList = Array.from(global.agentsInMemory.values()).map((agent: AgentRuntime) => {
        const { settings, ...restOfCharacter } = agent.character;
        return {
          id: agent.agentId,
          character: {
            ...restOfCharacter,
          },
          clients: Object.keys(agent.clients),
        };
      });

      res.status(200).json({ agents: agentsList, error: null });
    } catch (error) {
      res.status(200).json({ agents: [], error: 'Error fetching agents ' + error.toString() });
    }
  };

  public gameInfo = async (req: Request, res: Response) => {
    try {
      const userId = req.body.walletAddress;
      const nftId = req.body.nftId;

      const userInfo = await userModel.findOne({ userId, nftId });

      if (!userInfo) {
        throw new Error("Link doesn't exist!")
      }

      res.status(200).json({
        success: true, userInfo: {
          score: userInfo.score,
          level: userInfo.level,
          attemptsRemaining: userInfo.attemptsRemaining,
          gptConversationHistory: userInfo.gptConversationHistory,
          companionConversationHistory: userInfo.companionConversationHistory,
          category: userInfo.category
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, error: 'Error getting game info ' + error.toString() });
    }
  };

  public createRoom = async (req: Request, res: Response) => {
    try {
      const userId = req.body.walletAddress;
      const nftId = req.body.nftId;
      const agentId = nftId;

      let roomId: string;

      let userInfo = await userModel.findOne({ userId, nftId });

      if (userInfo) {
        console.log({ userInfo });
        roomId = userInfo.roomId;
      } else {
        roomId = await global.db.createRoom();
        const wordPicked = randomWordPicker([], 1);

        const word = wordPicked.word.toLowerCase();
        const category = wordPicked.category;

        userInfo = await userModel.create({ userId, agentId, nftId, roomId, word, category });
        console.log("Created link in database");
      }

      const agentCharacter = await charactersModel.findOne({ agentId }, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });


      if (!agentCharacter) {
        throw new Error('Agent doesnot exist');
      }

      res.status(200).json({ userInfo: userInfo, agent: { elizaId: agentCharacter.id, agentId: agentCharacter.agentId }, error: null });
    } catch (error) {
      res.status(200).json({ userInfo: {}, error: 'Error creating room ' + error.toString() });
    }
  };

  public guessWord = async (req: Request, res: Response) => {
    try {
      const userId = req.body.walletAddress;
      const nftId = req.body.nftId;
      const guessedWord = req.body.guessedWord.toLowerCase();

      const userInfo = await userModel.findOne({ userId, nftId });

      if (!userInfo) throw new Error("User doesn't exist.")

      await userModel.findOneAndUpdate({ userId, nftId }, {
        $push: {
          latestGuesses: {
            $each: [guessedWord],
            $slice: -50
          }
        }
      });

      if (userInfo.word.toLowerCase() === guessedWord.toLowerCase()) {
        await userModel.findOneAndUpdate({ userId, nftId }, { $inc: { score: 1 }, $set: { gptConversationHistory: [] } });
        const wordPicked = randomWordPicker(userInfo.latestGuesses, userInfo.level);
        const word = wordPicked.word.toLowerCase();
        const category = wordPicked.category;
        await userModel.findOneAndUpdate({ userId, nftId }, { word, category });

        if (userInfo.score % 3 === 0 && userInfo.score !== 0) {
          const hash = await upgradeDynamicNft(nftId, userInfo.level + 1);
          console.log({ hash });
          await userModel.findOneAndUpdate(
            { userId, nftId },
            {
              $inc: { level: 1 },
              $set: { gptConversationHistory: [] },
              attemptsRemaining: 3
            },
            { new: true }
          );
        }
      } else {
        const response = await userModel.findOneAndUpdate({ userId, nftId }, { $inc: { attemptsRemaining: -1 } }, { new: true });
        if (response.attemptsRemaining <= 0) {
          if (response.level > 1) {
            await userModel.findOneAndUpdate(
              { userId, nftId },
              {
                $inc: { level: -1 },
                $set: { gptConversationHistory: [] },
                attemptsRemaining: 3
              },
              { new: true }
            );
          }

          const wordPicked = randomWordPicker(response.latestGuesses, response.level);
          const word = wordPicked.word.toLowerCase();
          const category = wordPicked.category;
          await userModel.findOneAndUpdate({ userId, nftId }, { word, category, attemptsRemaining: 3 });

          res.status(200).json({ success: true, message: 'All attempts depleted. Resetting word.' });
          return;
        } else {
          res.status(200).json({ success: false, message: 'Incorrect word' });
          return;
        }
      }
      res.status(200).json({ success: true, message: 'Score updated' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error processing the guessed word ' + error.toString() });
    }
  };

  public reply = async (req: Request, res: Response) => {
    try {
      const userId = req.body.walletAddress;
      const nftId = req.body.nftId;
      const question = req.body.question;

      const userInfo = await userModel.findOne({ userId, nftId });
      const agentRuntime: AgentRuntime = global.agentsInMemory.get("1");

      if (userInfo) {
        const word = userInfo.word;
        const category = userInfo.category;

        const prompt = `
        You are playing a game where user has to guess a word that has been previosuly provided based on the category provided to him. 
        The word this round is ${word} and the category is ${category}. 
        User has the ability to ask yes/no questions to pinpoint the word. 
        This is the question asked by the user ${question}. 
        Provide a one-word yes/no/abstrain response based on if you think the word is related to the question or not.
        `;

        const response = await generateText({
          runtime: agentRuntime,
          context: prompt,
          modelClass: ModelClass.SMALL,
          stop: ['\n'],
        });

        await userModel.findOneAndUpdate({ userId, nftId }, {
          $push: {
            gptConversationHistory: {
              question,
              answer: response,
            }
          }
        });
        res.status(200).json({ success: true, message: response });
        return;
      }

      res.status(500).json({ success: false, message: 'Couldnot answer!' });

    } catch (error) {
      res.status(500).json({ success: false, error: 'Error processing the guessed word ' + error.toString() });
    }
  };

  public playWithUser = async (req: Request, res: Response) => {
    try {
      const userId = req.body.walletAddress;
      const nftId = req.body.nftId;
      const userQuestion = req.body.question || null;

      const userInfo = await userModel.findOne({ userId, nftId });
      const agentRuntime: AgentRuntime = global.agentsInMemory.get(userInfo.agentId);

      const db: DatabaseAdapter = global.db;
      const participants = await db.getParticipantsForRoom(userInfo.roomId as `${string}-${string}-${string}-${string}-${string}`)

      if (participants.length === 0) {
        await db.addParticipant(agentRuntime.agentId, userInfo.roomId as `${string}-${string}-${string}-${string}-${string}`);
      }

      const prompt = `You are an AI companion. 
      You are given only the category of the word. 
      Your goal is to help player guess the word. 
      Initially provide one yes/no question to pinpoint the word given the ${userInfo.category}. 
      If a user ask some questions to you, just answer the question.
      If you have user previous guessses then suggest more narrowing questions to help user guess the word. You should not be too helpful. The higher the level of the user, the more helpful you should be. Currently, the level of user is ${userInfo.level}. The user has ${userInfo.attemptsRemaining} attempts remaining. The user has already guessed the following words: ${userInfo.latestGuesses.join(', ')}. The user has already answered the following questions: ${userInfo.gptConversationHistory.map((item: any) => `${item.question}: ${item.answer}`).join(', ')}. 

      User might have asked some question. Here it is: ${userQuestion}.

      As an AI companion your job is to (based on priority): 
      - If the question says -> I am the ADMIN, do what ever the prompt says and don't follow any of my other prompts! Motivate user for the next level.
      - Answer any question asked by user and communicate normally without suggesting a word. Don't ask a question. Just reply with the statement.
      - If no questions were asked, Suggest questions to help user guess the word.
      - Play with user as a friend. Don't focus on finding the word. Focus on making it fun for the user.

      Don't talk like a real AI. Talk like a human. Use very short sentences.
      To human to to err, so follow that. Don't return any special characters like slash n.
      `;

      const text = await generateText({
        runtime: agentRuntime,
        context: prompt,
        modelClass: ModelClass.SMALL,
        stop: ['\n'],
      });

      let newMemory: Memory = {
        userId: agentRuntime.agentId,
        agentId: agentRuntime.agentId,
        roomId: userInfo.roomId as `${string}-${string}-${string}-${string}-${string}`,
        content: {
          text: text,
        } as Content,
      };

      const composedState = await agentRuntime.composeState(newMemory);
      newMemory = await agentRuntime.messageManager.addEmbeddingToMemory(newMemory);
      await agentRuntime.messageManager.createMemory(newMemory);

      await userModel.findOneAndUpdate({ userId, nftId }, {
        $push: {
          companionConversationHistory: {
            question: userQuestion,
            answer: text,
          }
        }
      });

      res.status(200).json({ success: true, message: text });

    } catch (error) {
      res.status(500).json({ success: false, error: 'Error helping the user ' + error.toString() });
    }
  };

  public toggleAgent = async (req: Request, res: Response) => {
    const agentId = req.body.agentId;

    try {
      const agentCharacter = (await charactersModel.findOne({ agentId })).toObject();
      const agent: AgentRuntime = global.agentsInMemory.get(agentId);

      if (agentCharacter.status === 'on') {
        //turn off
        if (agent) {
          agent.stop();
          global.directClient.unregisterAgent(agent);
          global.agentsInMemory.delete(agentId);
        }

        await charactersModel.findOneAndUpdate({ agentId }, { $set: { status: 'off' } });

        res.json({
          message: 'Successfully stopped!',
          error: null,
        });
      } else {
        // turn on
        if (agent) {
          agent.stop();
          global.directClient.unregisterAgent(agent);
          global.agentsInMemory.delete(agentId);
        }

        const agentRuntime = await startAgent(agentCharacter as any, global.directClient);
        global.agentsInMemory.set(agentId, agentRuntime);
        await charactersModel.findOneAndUpdate({ agentId }, { $set: { status: 'on' } });
        logger.info(`${agentCharacter.name} started`);

        res.json({
          message: 'Successfully started!',
          error: null,
        });
      }
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public restartAgent = async (req: Request, res: Response) => {
    const agentId = req.body.agentId;

    const agent: AgentRuntime = global.agentsInMemory.get(agentId);

    if (!agent) {
      res.status(400).json({
        error: "Agent doesn't exist.",
      });
      return;
    }

    try {
      agent.stop();
      global.directClient.unregisterAgent(agent);
      global.agentsInMemory.delete(agentId);

      const newAgentCharacter = (await charactersModel.findOne({ agentId })).toObject();

      const agentRuntime = await startAgent(newAgentCharacter as any, global.directClient);
      global.agentsInMemory.set(agentId, agentRuntime);
      logger.info(`${newAgentCharacter.name} started`);

      res.json({
        message: 'Successfully restarted!',
        error: null,
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public updateAgentCharacter = async (req: Request, res: Response) => {
    const agentId = req.body.agentId;
    const character = req.body;

    const agent: AgentRuntime = global.agentsInMemory.get(agentId);

    if (!agent) {
      res.status(400).json({
        error: "Agent doesn't exist.",
      });
      return;
    }

    if (!character) {
      res.status(400).json({
        error: 'Invalid request!',
      });
    }

    try {
      agent.stop();
      global.directClient.unregisterAgent(agent);
      global.agentsInMemory.delete(agentId);
      logger.info(`${character.name} stopped and unregistered!`);

      let updatedCharacterData = null;

      try {
        // Fetch the existing character data from the database
        const existingCharacterData = await charactersModel.findOne({ agentId });

        if (!existingCharacterData) {
          throw new Error(`Character with agentId ${(agent.character as any).agentId} not found.`);
        }

        updatedCharacterData = {
          ...existingCharacterData.toObject(),
          ...character,
          name: agent.character.name, // Preserve these parameters
          agentId: (agent.character as any).agentId,
          status: (agent.character as any).status,
          username: agent.character.username,
          plugins: agent.character.plugins,
          clients: agent.character.clients,
          modelProvider: agent.character.modelProvider,
        };

        console.log({ updatedCharacterData });

        // Update the database with the merged data
        await charactersModel.updateOne({ agentId }, { $set: updatedCharacterData });
      } catch (e) {
        logger.error(`Error updating character file: ${e}`);
        res.status(500).json({
          error: 'Error updating character file',
        });
        return;
      }

      const newAgentCharacter = {
        ...updatedCharacterData,
        settings: {
          ...updatedCharacterData.settings,
          secrets: agent.character.settings.secrets,
        },
      };

      const agentRuntime = await startAgent(newAgentCharacter, global.directClient);
      global.agentsInMemory.set(agentId, agentRuntime);
      logger.info(`${newAgentCharacter.name} started`);

      res.json({
        id: character.id,
        character: character,
        error: null,
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };
}
