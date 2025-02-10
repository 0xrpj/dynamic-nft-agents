import { Character, ModelProviderName, settings, validateCharacterConfig } from '@elizaos/core';
import fs from 'fs';

export async function loadCharacters(characterPaths: string[]): Promise<Character[]> {
  const loadedCharacters = [];
  if (characterPaths?.length > 0) {
    for (const path of characterPaths) {
      try {
        const character = JSON.parse(fs.readFileSync(path, 'utf8'));

        validateCharacterConfig(character);

        loadedCharacters.push(character);
      } catch (e) {
        console.error(`Error loading character from ${path}: ${e}`);
        // don't continue to load if a specified file is not found
        process.exit(1);
      }
    }
  }

  return loadedCharacters;
}

export async function loadCharactersFromDB(characters: Array<Object>): Promise<Character[]> {
  const loadedCharacters = [];
  if (characters.length > 0) {
    for (const char of characters) {
      try {
        validateCharacterConfig(char);
        loadedCharacters.push(char);
      } catch (e) {
        console.error(`Error loading character: ${e}`);
      }
    }
  }

  return loadedCharacters;
}

export function getTokenForProvider(provider: ModelProviderName, character: Character) {
  switch (provider) {
    case ModelProviderName.OPENAI:
      return character.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY;
    case ModelProviderName.LLAMACLOUD:
      return (
        character.settings?.secrets?.LLAMACLOUD_API_KEY ||
        settings.LLAMACLOUD_API_KEY ||
        character.settings?.secrets?.TOGETHER_API_KEY ||
        settings.TOGETHER_API_KEY ||
        character.settings?.secrets?.XAI_API_KEY ||
        settings.XAI_API_KEY ||
        character.settings?.secrets?.OPENAI_API_KEY ||
        settings.OPENAI_API_KEY
      );
    case ModelProviderName.ANTHROPIC:
      return (
        character.settings?.secrets?.ANTHROPIC_API_KEY ||
        character.settings?.secrets?.CLAUDE_API_KEY ||
        settings.ANTHROPIC_API_KEY ||
        settings.CLAUDE_API_KEY
      );
    case ModelProviderName.REDPILL:
      return character.settings?.secrets?.REDPILL_API_KEY || settings.REDPILL_API_KEY;
    case ModelProviderName.OPENROUTER:
      return character.settings?.secrets?.OPENROUTER || settings.OPENROUTER_API_KEY;
    case ModelProviderName.GROK:
      return character.settings?.secrets?.GROK_API_KEY || settings.GROK_API_KEY;
    case ModelProviderName.HEURIST:
      return character.settings?.secrets?.HEURIST_API_KEY || settings.HEURIST_API_KEY;
    case ModelProviderName.GROQ:
      return character.settings?.secrets?.GROQ_API_KEY || settings.GROQ_API_KEY;
    default:
      return null;
  }
}
