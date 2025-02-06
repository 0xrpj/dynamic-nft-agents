import {
  AgentRuntime,
  composeContext,
  Content,
  elizaLogger,
  generateMessageResponse,
  generateText,
  getEmbeddingZeroVector,
  Memory,
  ModelClass,
  stringToUuid,
  trimTokens,
} from '@elizaos/core';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { startAgent } from '../agent/agent.js';
import { createTweetObject, handleNoteTweet, processAndCacheTweet, sendQuoteTweet, sendStandardTweet } from '../services/twitter.service.js';
import { twitterMessageHandlerTemplate, twitterPostTemplate } from '../agent/constant.js';
import { DEFAULT_MAX_TWEET_LENGTH, validateTwitterConfig } from '../agent/environment.js';
import { ClientBase } from '../agent/base.js';
import { Tweet } from 'agent-twitter-client';
import { DirectClient } from '@elizaos/client-direct';
import charactersModel from '../models/character.model.js';
import userModel from '../models/user.model.js';
import { isItRelated, randomWordPicker } from '../utils/util.js';

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
          conversationHistory: userInfo.conversationHistory,
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
      const agentId = '2';

      let roomId: string;

      let userInfo = await userModel.findOne({ userId });

      if (userInfo) {
        roomId = userInfo.roomId;
      } else {
        roomId = await global.db.createRoom();
        const wordPicked = randomWordPicker([], 1);

        const word = wordPicked.word.toLowerCase();
        const category = wordPicked.category;

        userInfo = await userModel.create({ userId, agentId, nftId, roomId, word, category });
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
        await userModel.findOneAndUpdate({ userId, nftId }, { $inc: { score: 1 } });
        const wordPicked = randomWordPicker(userInfo.latestGuesses, userInfo.level);
        const word = wordPicked.word.toLowerCase();
        const category = wordPicked.category;
        await userModel.findOneAndUpdate({ userId, nftId }, { word, category });

        if (userInfo.score % 3 === 0 && userInfo.score !== 0) {
          await userModel.findOneAndUpdate(
            { userId, nftId },
            {
              $inc: { level: 1 },
              $set: { conversationHistory: [] },
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
                $set: { conversationHistory: [] },
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

      if (userInfo) {
        const word = userInfo.word;
        const category = userInfo.category;
        // add to conversation history
        const response = await isItRelated(word, category, question);
        await userModel.findOneAndUpdate({ userId, nftId }, {
          $push: {
            conversationHistory: {
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

  // public playWithUser = async(req: Request, res: Response) => {
  //   const userId = req.body.walletAddress
  //   - category of the word
  //   - wallet_address
  //   Working:
  //   - Give AI the context of the game, category of the word and get initial question suggestion given the category of the word.
  //   Response
  //   - gameStatus
  //   - yes/no question
  // }

  // public greetUser = async (req: Request, res: Response) => {
  //   try {
  //     const agentId = "2"
  //     const agentRuntime: AgentRuntime = global.agentsInMemory.get(agentId);
  //     const context = "You are playing guess the word game as a companion. Generate an encouraging greeting message for the player"
  //     const greetMessage = await generateText({
  //       runtime: agentRuntime,
  //       context,
  //       modelClass: ModelClass.SMALL,
  //     });
  //     res.status(200).json({ greetings: greetMessage, error: null });
  //   } catch (error) {
  //     res.status(200).json({ agents: [], error: 'Error getting greetings' + error.toString() });
  //   }
  // };

  // public playWithUser = async(req: Request, res: Response)=>{
  //   try {
  //     const agentId = "2"
  //     const agentRuntime: AgentRuntime = global.agentsInMemory.get(agentId);
  //     let memory: Memory = agentRuntime.composeState()
  //     const content: Content
  //     if (!memory) {
  //       const roomId = stringToUuid("Game Room" + '-' + agentRuntime.agentId);
  //       const memory = await agentRuntime.messageManager.createMemory({
  //         id: stringToUuid(roomId + '-' + agentRuntime.agentId),
  //         agentId: agentRuntime.agentId,
  //         content: {
  //           text: ,
  //         },
  //         roomId,
  //         userId: agentRuntime.agentId,
  //         embedding: getEmbeddingZeroVector(),
  //       });
  //     }

  //     let new_memory = await agentRuntime.messageManager.addEmbeddingToMemory(memory);

  //     await agentRuntime.messageManager.createMemory(new_memory);
  //     const recentMessages =
  //     const context = "You are playing guess the word game as a companion. You are given only the category of the word. Your goal is to help player guess the game. For first guesses provide a yes/no question to pinpoint the food given the {category}. If you have user previous guessses then suggest more narrowing questions to help user guess the word."

  //     const greetMessage = await generateText({
  //       runtime: agentRuntime,
  //       context,
  //       modelClass: ModelClass.SMALL,
  //     });
  //     res.status(200).json({ greetings: greetMessage, error: null });
  //   } catch (error) {
  //     res.status(200).json({ agents: [], error: 'Error getting greetings' + error.toString() });
  //   }
  // }

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

  public generateNewTweet = async (req: Request, res: Response) => {
    elizaLogger.log('Generating new tweet');
    const agentId = req.body.agentId;
    const agentRuntime = global.agentsInMemory.get(agentId);

    try {
      const roomId = stringToUuid('twitter_generate_room-' + agentRuntime.character.twitterProfile.username);
      await agentRuntime.ensureUserExists(
        agentRuntime.agentId,
        agentRuntime.character.twitterProfile.username,
        agentRuntime.character.name,
        'twitter',
      );

      const topics = agentRuntime.character.topics.join(', ');

      const state = await agentRuntime.composeState(
        {
          userId: agentRuntime.agentId,
          roomId: roomId,
          agentId: agentRuntime.agentId,
          content: {
            text: topics || '',
            action: 'TWEET',
          },
        },
        {
          twitterUserName: agentRuntime.character.twitterProfile.username,
        },
      );

      const context = composeContext({
        state,
        template: twitterPostTemplate,
      });

      elizaLogger.debug('generate post prompt:\n' + context);

      const newTweetContent = await generateText({
        runtime: agentRuntime,
        context,
        modelClass: ModelClass.SMALL,
      });

      // First attempt to clean content
      let cleanedContent = '';

      //  Try parsing as JSON first
      try {
        const parsedResponse = JSON.parse(newTweetContent);
        if (parsedResponse.text) {
          cleanedContent = parsedResponse.text;
        } else if (typeof parsedResponse === 'string') {
          cleanedContent = parsedResponse;
        }
      } catch (error) {
        error.linted = true; // make linter happy since catch needs a variable
        // If not JSON, clean the raw content
        cleanedContent = newTweetContent
          .replace(/^\s*{?\s*"text":\s*"|"\s*}?\s*$/g, '') // Remove JSON-like wrapper
          .replace(/^['"](.*)['"]$/g, '$1') // Remove quotes
          .replace(/\\"/g, '"') // Unescape quotes
          .replace(/\\n/g, '\n\n') // Unescape newlines, ensures double spaces
          .trim();
      }

      if (!cleanedContent) {
        elizaLogger.error('Failed to extract valid content from response:', {
          rawResponse: newTweetContent,
          attempted: 'JSON parsing',
        });
        return;
      }

      // Truncate the content to the maximum tweet length specified in the environment settings, ensuring the truncation respects sentence boundaries.
      const maxTweetLength = 280; // MAX_TWEET_LENGTH 120

      cleanedContent = await trimTokens(cleanedContent, maxTweetLength, agentRuntime);

      const removeQuotes = (str: string) => str.replace(/^['"](.*)['"]$/, '$1');

      const fixNewLines = (str: string) => str.replaceAll(/\\n/g, '\n\n'); //ensures double spaces

      // Final cleaning
      cleanedContent = removeQuotes(fixNewLines(cleanedContent));

      res.status(200).json({
        content: cleanedContent,
        messageLength: cleanedContent.length,
        error: null,
      });
    } catch (e) {
      elizaLogger.error('Error generating new tweet:', e);
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public generateTweetOnReference = async (req: Request, res: Response) => {
    try {
      const agentId = req.body.agentId;
      const tweetUrl = req.body.tweetUrl;

      const url = new URL(tweetUrl);
      const tweetId = url.pathname.split('/').pop();
      const agentRuntime: AgentRuntime = global.agentsInMemory.get(agentId);
      const scraper = agentRuntime.clients.get('twitter');
      // await scraper.sendTweet('Tweeting from code!!');
      const tweet = await scraper.getTweet(tweetId);

      if (tweet.userId === agentRuntime.character.twitterProfile.id) {
        // Skip processing if the tweet is from the bot itself
        throw new Error('The tweet is from bot itself.');
      }

      const formatTweet = (tweet: Tweet) => {
        return `  ID: ${tweet.id}
                    From: ${tweet.name} (@${tweet.username})
                    Text: ${tweet.text}`;
      };

      const formattedConversation = [tweet]
        .map(
          tweet => `@${tweet.username} (${new Date(tweet.timestamp * 1000).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
          })}):
                    ${tweet.text}`,
        )
        .join('\n\n');

      const currentPost = formatTweet(tweet);

      const userIdUUID = tweet.userId === agentRuntime.character.twitterProfile.id ? agentRuntime.agentId : stringToUuid(tweet.userId!);

      const roomId = stringToUuid(tweet.conversationId + '-' + agentRuntime.agentId);

      const message = {
        content: { text: tweet.text },
        agentId: agentRuntime.agentId,
        userId: userIdUUID,
        roomId,
      };

      const state = await agentRuntime.composeState(message, {
        twitterClient: scraper,
        twitterUserName: agentRuntime.character.settings?.secrets?.TWITTER_USERNAME,
        currentPost,
        formattedConversation,
      });

      const tweetExists = await agentRuntime.messageManager.getMemoryById(stringToUuid(tweet.id + '-' + agentRuntime.agentId));

      const twitterConfig = await validateTwitterConfig(agentRuntime);
      const client = new ClientBase(agentRuntime, twitterConfig);

      if (!tweetExists) {
        console.log('tweet does not exist, saving');
        const userIdUUID = stringToUuid(tweet.userId as string);
        const roomId = stringToUuid(tweet.conversationId);

        const message: any = {
          id: tweetId,
          agentId: agentRuntime.agentId,
          content: {
            text: tweet.text,
            url: tweet.permanentUrl,
            inReplyTo: tweet.inReplyToStatusId ? stringToUuid(tweet.inReplyToStatusId + '-' + agentRuntime.agentId) : undefined,
          },
          userId: userIdUUID,
          roomId,
          createdAt: tweet.timestamp * 1000,
        };
        client.saveRequestMessage(message, state);
      }

      const context = composeContext({
        state,
        template: twitterMessageHandlerTemplate,
      });

      const response = await generateMessageResponse({
        runtime: agentRuntime,
        context,
        modelClass: ModelClass.SMALL,
      });

      const maxTweetLength = 280; // MAX_TWEET_LENGTH 120
      let updatedTweet = response.text;

      if (response.text.length >= maxTweetLength) {
        updatedTweet = await trimTokens(response.text, maxTweetLength, agentRuntime);
      }

      res.status(200).json({
        message: updatedTweet,
        messageLength: updatedTweet.length,
        error: null,
      });
    } catch (e) {
      elizaLogger.error('Error generating referenced tweet:', e);
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public postTweet = async (req: Request, res: Response) => {
    try {
      const agentId = req.body.agentId;
      const tweet = req.body.tweet;
      const agentRuntime = global.agentsInMemory.get(agentId);

      const roomId = stringToUuid('twitter_generate_room-' + agentRuntime.character.twitterProfile.username);

      elizaLogger.log(`Posting new tweet:\n ${tweet}`);
      elizaLogger.log(`Posting new tweet:\n`);

      const twitterConfig = await validateTwitterConfig(agentRuntime);
      const client = new ClientBase(agentRuntime, twitterConfig);

      let result;

      if (tweet.length > DEFAULT_MAX_TWEET_LENGTH) {
        console.log('Handling note tweet');
        result = await handleNoteTweet(client, tweet);
      } else {
        console.log('Handling standard tweet');
        result = await sendStandardTweet(client, tweet);

        console.log({ result });
      }

      const tweetData = createTweetObject(result, client, twitterConfig);

      await processAndCacheTweet(agentRuntime, client, tweetData, roomId, tweet);

      res.status(200).json({
        error: null,
        message: 'Successfully posted tweet',
      });
    } catch (error) {
      elizaLogger.error('Error posting tweet:', error.toString());
      res.status(500).json({
        error: error.toString(),
      });
    }
  };

  public replyTweet = async (req: Request, res: Response) => {
    try {
      const agentId = req.body.agentId;
      const replyTweetUrl = req.body.tweetUrl;
      const tweet = req.body.reply;
      const agentRuntime = global.agentsInMemory.get(agentId);

      const url = new URL(replyTweetUrl);
      const tweetId = url.pathname.split('/').pop();

      const roomId = stringToUuid('twitter_generate_room-' + agentRuntime.character.twitterProfile.username);

      const twitterConfig = await validateTwitterConfig(agentRuntime);
      const client = new ClientBase(agentRuntime, twitterConfig);

      let result;

      console.log({ length: tweet.length, DEFAULT_MAX_TWEET_LENGTH });

      if (tweet.length > DEFAULT_MAX_TWEET_LENGTH) {
        res.status(400).json({
          error: 'Too long reply. Max characters: ' + DEFAULT_MAX_TWEET_LENGTH + ' Current characters: ' + tweet.length,
        });

        return;
      } else {
        result = await sendStandardTweet(client, tweet, tweetId);
      }

      const tweetData = createTweetObject(result, client, twitterConfig);

      await processAndCacheTweet(agentRuntime, client, tweetData, roomId, tweet);

      res.status(200).json({
        error: null,
        message: 'Successfully posted tweet',
      });
    } catch (error) {
      elizaLogger.error('Error replying tweet:', error.toString());
      res.status(500).json({
        error: error.toString(),
      });
    }
  };

  public quoteTweet = async (req: Request, res: Response) => {
    try {
      const agentId = req.body.agentId;
      const replyTweetUrl = req.body.tweetUrl;
      const tweet = req.body.reply;
      const agentRuntime = global.agentsInMemory.get(agentId);

      const url = new URL(replyTweetUrl);
      const tweetId = url.pathname.split('/').pop();

      const roomId = stringToUuid('twitter_generate_room-' + agentRuntime.character.twitterProfile.username);

      const twitterConfig = await validateTwitterConfig(agentRuntime);
      const client = new ClientBase(agentRuntime, twitterConfig);

      let result;

      console.log({ length: tweet.length, DEFAULT_MAX_TWEET_LENGTH });

      if (tweet.length > DEFAULT_MAX_TWEET_LENGTH) {
        res.status(400).json({
          error: 'Too long reply. Max characters: ' + DEFAULT_MAX_TWEET_LENGTH + ' Current characters: ' + tweet.length,
        });
      } else {
        result = await sendQuoteTweet(client, tweet, tweetId);
        console.log({ result });
      }

      const tweetData = createTweetObject(result, client, twitterConfig);

      await processAndCacheTweet(agentRuntime, client, tweetData, roomId, tweet);

      res.status(200).json({
        error: null,
        message: 'Successfully posted tweet',
      });
    } catch (error) {
      elizaLogger.error('Error replying tweet:', error.toString());
      res.status(500).json({
        error: error.toString(),
      });
    }
  };
}
