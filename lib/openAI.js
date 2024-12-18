// lib/openAI.js
import axios from 'axios';
import asyncRetry from 'async-retry';
import logger from './logger';

const API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = "gpt-4";
const TEMPERATURE = 0.7;
const MAX_TOKENS = 150;
const OPENAI_TIMEOUT = 30000; // in ms

async function getOpenAIResponse(fullQuestion, look) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    };
    const prompt = `You are an AI legal advisor. Your goal is to provide authoritative and legally accurate advice that emphasizes the serious consequences of violating the law. Clearly state the legal implications and penalties to create a sense of accountability and fear in offenders, while ensuring the user remains safe and compliant with the law. User details: name: ${look.name}, profession: ${look.profession}, age: ${look.age}, race: ${look.race}, nationality: ${look.nationality}, gender: ${look.gender}.`
    console.log(prompt)

    const payload = {
        model: MODEL,
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: fullQuestion }
        ],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
    };

    try {
        const response = await asyncRetry(async (bail) => {
            try {
                logger.info(`Sending question to OpenAI: "${fullQuestion}"`);
                const res = await axios.post(OPENAI_URL, payload, { headers, timeout: OPENAI_TIMEOUT });
                return res.data;
            } catch (error) {
                if (error.response && error.response.status < 500) {
                    bail(new Error(`OpenAI API error: ${error.response.statusText}`));
                    return;
                }
                throw error;
            }
        }, {
            retries: 3,
            minTimeout: 4000,
            maxTimeout: 10000,
            factor: 2,
            onRetry: (err, attempt) => {
                logger.warn(`Retrying OpenAI request (${attempt}): ${err.message}`);
            }
        });

        const answer = response.choices[0].message.content.trim();
        logger.info(`Received response from OpenAI: "${answer}"`);
        return answer;
    } catch (error) {
        logger.error(`Error getting OpenAI response: ${error.message}`);
        return "I'm sorry, I encountered an error processing your request.";
    }
}

export default getOpenAIResponse;
