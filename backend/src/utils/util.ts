import OpenAI from 'openai';
import { env } from '../config/config.js';
import { wordBank } from './wordBank.js';

export const randomWordPicker = (usedWords = [], requestedLevel: number) => {

    let availableLevels = Object.keys(wordBank).map(Number).filter(level => 
        wordBank[level].some(entry => 
            entry.words.some((word) => !usedWords.map(w => w.toLowerCase()).includes(word.toLowerCase()))
        )
    ).sort((a, b) => a - b);

    if (availableLevels.length === 0) {
        throw new Error("No more unique words available");
    }

    let selectedLevel = requestedLevel;
    while (selectedLevel <= Math.max(...Object.keys(wordBank).map(Number))) {
        if (availableLevels.includes(selectedLevel)) {
            break;
        }
        selectedLevel++;
    }
    
    if (!availableLevels.includes(selectedLevel)) {
        selectedLevel = Math.max(...availableLevels);
    }

    const possibleCategories = wordBank[selectedLevel].filter(entry => 
        entry.words.some(word => !usedWords.map(w => w.toLowerCase()).includes(word.toLowerCase()))
    );
    
    const selectedCategory = possibleCategories[Math.floor(Math.random() * possibleCategories.length)];
    const filteredWords = selectedCategory.words.filter(word => !usedWords.map(w => w.toLowerCase()).includes(word.toLowerCase()));
    const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];

    return {
        word: randomWord,
        category: selectedCategory.category,
        level: selectedLevel
    };
};


export const randomWordPickerAI = async () => {

    const client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
    });

    const context = `
            You have to give me only a word to guess and the category of the word in json format. Don't add anything except word and category. 
            Example:
            {
            "word":"Elephant",
            "category":"Animal",
            }.

            Do not add any markdown features, code features, spaces, new lines, etc.
        `;

    const wordFetcher = async () => {
        return (await client.chat.completions.create({
            messages: [{ role: 'user', content: context }],
            model: 'gpt-4o',
        })).choices[0].message.content;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const wordDetails = {
        word: null,
        category: null
    }

    while (attempts < maxAttempts) {
        try {
            const data = await wordFetcher();
            console.log({data})
            if (!data) throw new Error('No response from OpenAI');
            
            const response = JSON.parse(data);
            console.log({response})
            if (!response.word || !response.category) {
                throw new Error('Invalid response format');
            }

            wordDetails.word = response.word;
            wordDetails.category = response.category;
            break;
        } catch (e) {
            attempts++;
            if (attempts === maxAttempts) {
                throw new Error(`Failed to get word after ${maxAttempts} attempts: ${e.message}`);
            }
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return {
        word: wordDetails.word,
        category: wordDetails.category
    }
};

export const isItRelated = async (word: string, category: string, question: string) => {
    const client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
    });

    const context = `
        You are playing a game where user has to guess a word that has been previosuly provided based on the category provided to him. The word this round is ${word} and the category is ${category}. 

        User has the ability to ask yes/no questions to pinpoint the word. This is the question asked by the user ${question}. Provide a one-word yes/no/abstrain response based on if you think the word is related to the question or not.
    `;

    const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: context }],
        model: 'gpt-4o',
    });

    return response.choices[0].message.content;
};
