const axios = require("axios");
const buildPrompt = require("../utils/promptBuilder");
const parseAIResponse = require("../utils/responseParser");

const analyzeWithLLM = async(language, code, error, userPrompt) => {
    try {
        const AIprompt = buildPrompt(language, code, error, userPrompt);

        console.log("\n========== PROMPT SENT TO OLLAMA ==========\n");
        console.log(AIprompt);

        const response = await axios.post(
            "http://localhost:11434/api/generate", {
                model: "qwen2.5-coder:3b",
                prompt: AIprompt,
                stream: false,
            }, {
                timeout: 120000,
            }
        );

        if (!response.data || !response.data.response) {
            throw new Error("Empty response received from Ollama.");
        }

        console.log("\n========== RAW AI RESPONSE ==========\n");
        console.log(response.data.response);

        const parsedResponse = parseAIResponse(response.data.response);

        console.log("\n========== PARSED RESPONSE ==========\n");
        console.log(parsedResponse);

        return parsedResponse;

    } catch (error) {
        console.error("\n========== LLM SERVICE ERROR ==========\n");
        console.error(error);

        return {
            language: "Unknown",
            errorType: "Error",
            rootCause: "AI request failed.",
            explanation: "Unable to connect to the AI model or parse the response.",
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