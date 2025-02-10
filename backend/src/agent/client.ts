import { Character, IAgentRuntime } from '@elizaos/core';
import { Scraper } from 'agent-twitter-client';
import { ClientBase } from './base.js';
import { validateTwitterConfig } from './environment.js';

export async function initializeClients(character: Character, runtime: IAgentRuntime) {
  const clients = new Map<string, Scraper>();
  const clientTypes = character.clients?.map(str => str.toLowerCase()) || [];

  if (clientTypes.includes('twitter')) {
    const twitterConfig = await validateTwitterConfig(runtime);
    const clientBase = new ClientBase(runtime, twitterConfig);

    await clientBase.init();

    // const twitterClients = await TwitterClientInterface.start(runtime);
    // clients.push(twitterClients);

    // const scraper = new Scraper();
    // const isLoggedIn = await scraper.isLoggedIn();
    // console.log({ isLoggedIn })
    // if (!isLoggedIn) {
    //     console.log("Is not logged in");
    //     await scraper.login(character.settings?.secrets?.TWITTER_USERNAME, character.settings?.secrets?.TWITTER_PASSWORD);
    //     const cookies = await scraper.getCookies();
    //     console.log({ cookies });
    //     await scraper.setCookies(cookies);
    // }

    // const twitterConfig = await validateTwitterConfig(runtime);
    // const client = new ClientBase(runtime, twitterConfig)
    // const profile = await client.fetchProfile(character.settings?.secrets?.TWITTER_USERNAME);

    // console.log({profile});

    // if (profile) {
    //     runtime.character.twitterProfile = {
    //         id: profile.id,
    //         username: profile.username,
    //         screenName: profile.screenName,
    //         bio: profile.bio,
    //         nicknames: profile.nicknames,
    //     };

    clients.set('twitter', clientBase.twitterClient);
  }

  //   if (clientTypes.includes("auto")) {
  //     const autoClient = await AutoClientInterface.start(runtime);
  //     if (autoClient) clients.push(autoClient);
  //   }

  //   if (clientTypes.includes("discord")) {
  //     clients.push(await DiscordClientInterface.start(runtime));
  //   }

  //   if (clientTypes.includes("telegram")) {
  //     const telegramClient = await TelegramClientInterface.start(runtime);
  //     if (telegramClient) clients.push(telegramClient);
  //   }

  //   if (character.plugins?.length > 0) {
  //     for (const plugin of character.plugins) {
  //       if (plugin.clients) {
  //         for (const client of plugin.clients) {
  //           clients.push(await client.start(runtime));
  //         }
  //       }
  //     }
  //   }

  return clients;
}
