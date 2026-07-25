const OpenAI = require("openai");
const buildPrompt = require("../utils/promptBuilder");
const parseAIResponse = require("../utils/responseParser");

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const analyzeWithLLM = async(language, code, error, userPrompt) => {
    try {
        const AIprompt = buildPrompt(language, code, error, userPrompt);

        console.log("\n========== PROMPT SENT TO GROQ ==========\n");
        console.log(AIprompt);

        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{
                    role: "system",
                    content: "You are an expert software engineer. Always return ONLY valid JSON without markdown fences or explanations.",
                },
                {
                    role: "user",
                    content: AIprompt,
                },
            ],
            temperature: 0.2,
        });

        const aiResponse = completion.choices[0].message.content;

        console.log("\n========== RAW AI RESPONSE ==========\n");
        console.log(aiResponse);

        const parsedResponse = parseAIResponse(aiResponse);

        console.log("\n========== PARSED RESPONSE ==========\n");
        console.log(parsedResponse);

        return parsedResponse;
    } catch (error) {
        console.error("\n========== GROQ ERROR ==========\n");
        console.error(error);

        return {
            language: "Unknown",
            errorType: "Error",
            rootCause: "AI request failed.",
            explanation: "Unable to connect to Groq or parse the response.",
            fixedCode: "",
            alternativeFix: "",
            summary: "",
            confidence: 0,
            bestPractices: [],
        };
    }
};

module.exports = {
    analyzeWithLLM,
};