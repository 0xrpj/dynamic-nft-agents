import { ActionExample, IAgentRuntime, Memory, Content, State, ModelClass, generateText, HandlerCallback, type Action } from '@elizaos/core';

export const currentNewsAction: Action = {
  name: 'CURRENT_NEWS',
  similes: ['FETCH', 'SEARCH', 'GET_NEWS', 'DO YOU KNOW', 'TELL ME ABOUT'],
  validate: async (_runtime: IAgentRuntime, _message: Memory) => {
    return true;
  },
  description: 'Fetch real time knowledge about a topic and provide as a context',
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    _options: { [key: string]: unknown },
    _callback: HandlerCallback,
  ): Promise<boolean> => {
    async function getCurrentNews(searchTerm: string) {
      const response = await fetch(`https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${process.env.NEWS_API_KEY}`);
      const data = await response.json();
      return data.articles.slice(0, 5).map(article => `${article.title}\n${article.description}\n${article.url}\n${article.content.slice(0, 1000)}`);
    }

    const context = `
            Extract the following information from the {{userName}}. The message is ${_message.content.text}.
            Only respond with search term and don't include any other text.
            `;

    const searchTerm = await generateText({
      runtime: _runtime,
      context: context,
      modelClass: ModelClass.SMALL,
      stop: ['\n'],
    });

    const currentNews = await getCurrentNews(searchTerm);

    const responseText = 'The current news for' + searchTerm + 'is: ' + currentNews;

    let newMemory: Memory = {
      userId: _message.agentId,
      agentId: _message.agentId,
      roomId: _message.roomId,
      content: {
        text: responseText,
        action: 'CURRENT_NEWS_RESPONSE',
        source: _message.content?.source,
      } as Content,
    };
    newMemory = await _runtime.messageManager.addEmbeddingToMemory(newMemory);
    await _runtime.messageManager.createMemory(newMemory);

    _callback(newMemory.content);

    return true;
  },
  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'Get me some news about gangstaverse' },
      },
      {
        user: '{{user2}}',
        content: { text: 'oh hey', action: 'CURRENT_NEWS' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: {
          text: 'did u see some faster whisper just came out',
        },
      },
      {
        user: '{{user2}}',
        content: {
          text: 'yeah but its a pain to get into node.js',
          action: 'NONE',
        },
      },
    ],
    [
      {
        user: '{{user1}}',
        content: {
          text: 'the things that were funny 6 months ago are very cringe now',
          action: 'NONE',
        },
      },
      {
        user: '{{user2}}',
        content: {
          text: 'lol true',
          action: 'NONE',
        },
      },
      {
        user: '{{user1}}',
        content: { text: 'too real haha', action: 'NONE' },
      },
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'gotta run', action: 'NONE' },
      },
      {
        user: '{{user2}}',
        content: { text: 'Okay, ttyl', action: 'NONE' },
      },
      {
        user: '{{user1}}',
        content: { text: '', action: 'IGNORE' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: 'heyyyyyy', action: 'NONE' },
      },
      {
        user: '{{user2}}',
        content: { text: 'whats up long time no see' },
      },
      {
        user: '{{user1}}',
        content: {
          text: 'chillin man. playing lots of fortnite. what about you',
          action: 'NONE',
        },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: 'u think aliens are real', action: 'NONE' },
      },
      {
        user: '{{user2}}',
        content: { text: 'ya obviously', action: 'NONE' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: 'drop a joke on me', action: 'NONE' },
      },
      {
        user: '{{user2}}',
        content: {
          text: 'why dont scientists trust atoms cuz they make up everything lmao',
          action: 'NONE',
        },
      },
      {
        user: '{{user1}}',
        content: { text: 'haha good one', action: 'NONE' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: {
          text: 'hows the weather where ur at',
          action: 'NONE',
        },
      },
      {
        user: '{{user2}}',
        content: { text: 'beautiful all week', action: 'NONE' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: 'Can you fetch the latest news on climate change?', action: 'CURRENT_NEWS' },
      },
      {
        user: '{{user2}}',
        content: { text: 'Fetching the latest news on climate change...', action: 'CURRENT_NEWS' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: "What's happening in the tech world today?", action: 'CURRENT_NEWS' },
      },
      {
        user: '{{user2}}',
        content: { text: 'Let me get the latest tech news for you.', action: 'CURRENT_NEWS' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: 'I need updates on the stock market.', action: 'CURRENT_NEWS' },
      },
      {
        user: '{{user2}}',
        content: { text: "Here's the latest on the stock market.", action: 'CURRENT_NEWS' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: 'Tell me the top headlines for today.', action: 'CURRENT_NEWS' },
      },
      {
        user: '{{user2}}',
        content: { text: "Fetching today's top headlines...", action: 'CURRENT_NEWS' },
      },
    ],

    [
      {
        user: '{{user1}}',
        content: { text: 'Any news about the upcoming elections?', action: 'CURRENT_NEWS' },
      },
      {
        user: '{{user2}}',
        content: { text: "Here's the latest on the upcoming elections.", action: 'CURRENT_NEWS' },
      },
    ],
  ] as ActionExample[][],
} as Action;
