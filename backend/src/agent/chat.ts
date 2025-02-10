import { settings } from '@elizaos/core';
import readline from 'readline';
import fetch from 'node-fetch';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});

async function handleUserInput(input, agentId) {
  if (input.toLowerCase() === 'exit') {
    rl.close();
    process.exit(0);
  }

  try {
    const serverPort = parseInt(settings.SERVER_PORT || '3000');

    const response = await fetch(`http://localhost:${serverPort + 1}/${agentId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input,
        userId: 'user',
        userName: 'User',
      }),
    });

    console.log({ response });

    const data: any = await response.json();
    data.forEach(message => console.log(`${'Agent'}: ${message.text}`));
  } catch (error) {
    console.error('Error fetching response:', error);
  }
}

export function startChat(characters) {
  function chat() {
    const agentId = characters[0].name ?? 'Agent';
    rl.question('You: ', async input => {
      await handleUserInput(input, agentId);
      if (input.toLowerCase() !== 'exit') {
        chat(); // Loop back to ask another question
      }
    });
  }

  return chat;
}
