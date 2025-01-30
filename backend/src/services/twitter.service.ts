import { elizaLogger, getEmbeddingZeroVector, IAgentRuntime, stringToUuid, trimTokens, UUID } from '@elizaos/core';
import { Tweet } from 'agent-twitter-client';
import { ClientBase } from '../agent/base.js';

export const processAndCacheTweet = async (runtime: IAgentRuntime, client: ClientBase, tweet: Tweet, roomId: UUID, newTweetContent: string) => {
  // Cache the last post details
  await runtime.cacheManager.set(`twitter/${client.runtime.character.twitterProfile.username}/lastPost`, {
    id: tweet.id,
    timestamp: Date.now(),
  });

  // Cache the tweet
  await client.cacheTweet(tweet);

  // Log the posted tweet
  elizaLogger.log(`Tweet posted:\n ${tweet.permanentUrl}`);

  // Ensure the room and participant exist
  await runtime.ensureRoomExists(roomId);
  await runtime.ensureParticipantInRoom(runtime.agentId, roomId);

  // Create a memory for the tweet
  await runtime.messageManager.createMemory({
    id: stringToUuid(tweet.id + '-' + runtime.agentId),
    userId: runtime.agentId,
    agentId: runtime.agentId,
    content: {
      text: newTweetContent.trim(),
      url: tweet.permanentUrl,
      source: 'twitter',
    },
    roomId,
    embedding: getEmbeddingZeroVector(),
    createdAt: tweet.timestamp,
  });
};

export const createTweetObject = (tweetResult: any, client: any, twitterUsername: string): Tweet => {
  console.log({ tweetResult, clientData: client.runtime.character.twitterProfile });
  return {
    id: tweetResult.rest_id,
    name: client.runtime.character.twitterProfile.screenName,
    username: client.runtime.character.twitterProfile.username,
    text: tweetResult.legacy.full_text,
    conversationId: tweetResult.legacy.conversation_id_str,
    createdAt: tweetResult.legacy.created_at,
    timestamp: new Date(tweetResult.legacy.created_at).getTime(),
    userId: client.runtime.character.twitterProfile.id,
    inReplyToStatusId: tweetResult.legacy.in_reply_to_status_id_str,
    permanentUrl: `https://twitter.com/${twitterUsername}/status/${tweetResult.rest_id}`,
    hashtags: [],
    mentions: [],
    photos: [],
    thread: [],
    urls: [],
    videos: [],
  } as Tweet;
};

export const sendStandardTweet = async (client: ClientBase, content: string, tweetId?: string) => {
  try {
    const standardTweetResult = await client.requestQueue.add(async () => await client.twitterClient.sendTweet(content, tweetId));
    const body = await standardTweetResult.json();
    if (!body?.data?.create_tweet?.tweet_results?.result) {
      console.error('Error sending tweet; Bad response:', body);
      return;
    }
    return body.data.create_tweet.tweet_results.result;
  } catch (error) {
    console.log({ error });
    elizaLogger.error('Error sending standard Tweet:', error.toString());
    throw error;
  }
};

export const sendQuoteTweet = async (client: ClientBase, content: string, tweetId: string) => {
  try {
    const standardTweetResult = await client.requestQueue.add(async () => await client.twitterClient.sendQuoteTweet(content, tweetId));
    const body = await standardTweetResult.json();
    if (!body?.data?.create_tweet?.tweet_results?.result) {
      console.error('Error sending tweet; Bad response:', body);
      throw new Error('Error sending tweet: ' + body?.errors[0]?.message);
    }
    return body.data.create_tweet.tweet_results.result;
  } catch (error) {
    console.log({ error });
    elizaLogger.error('Error sending standard Tweet:', error.toString());
    throw error;
  }
};

// export const truncateToCompleteSentence = (text: string, maxLength: number)=> {
//     if (text.length <= maxLength) {
//         return text;
//     }
//     // Find the last complete sentence within maxLength
//     let lastPeriodIndex = text.lastIndexOf('.', maxLength);
//     if (lastPeriodIndex === -1) {
//         lastPeriodIndex = maxLength; // If no period is found, truncate at maxLength
//     }
//     return text.substring(0, lastPeriodIndex + 1).trim();
// }

export const handleNoteTweet = async (client: ClientBase, content: string, tweetId?: string) => {
  try {
    const noteTweetResult = await client.requestQueue.add(async () => await client.twitterClient.sendNoteTweet(content, tweetId));

    if (noteTweetResult.errors && noteTweetResult.errors.length > 0) {
      // Note Tweet failed due to authorization. Falling back to standard Tweet.
      // const truncateContent =
      // (
      //     content,
      //     240 //MAX_TWEET_LENGTH
      // );

      const truncateContent = await trimTokens(content, 240, client.runtime);

      return await sendStandardTweet(client, truncateContent, tweetId);
    } else {
      return noteTweetResult.data.notetweet_create.tweet_results.result;
    }
  } catch (error) {
    throw new Error(`Note Tweet failed: ${error}`);
  }
};
