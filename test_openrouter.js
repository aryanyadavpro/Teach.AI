const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.OPENROUTER_API_KEY;

async function generateData(topic) {
    console.log(`Generating AI data for: ${topic}`);
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            "model": "microsoft/phi-3-medium-128k-instruct:free",
            "messages": [
                {
                    "role": "user",
                    "content": `Generate a detailed educational summary about "${topic}". Include key concepts, definitions, and a brief history. Format as plain text.`
                }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
                "X-Title": "Learnify Student Project" // Required by OpenRouter
            }
        });

        const content = response.data.choices[0].message.content;
        console.log("\n--- Generated Content ---\n");
        console.log(content.substring(0, 500) + "...");
        return content;

    } catch (error) {
        console.error('OpenRouter Generation failed:', error.message);
        if (error.response) console.error("Response data:", error.response.data);
        return null;
    }
}

generateData("Photosynthesis");
