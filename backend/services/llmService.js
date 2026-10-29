const OpenAI = require("openai");
const buildPrompt = require("../utils/promptBuilder");
const parseAIResponse = require("../utils/responseParser");

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error("GROQ_API_KEY is not configured on the server.");
    error.status = 500;
    throw error;
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
    timeout: 30000, // 30s timeout
  });
};

const analyzeWithLLM = async (language, code, error, userPrompt) => {
  const client = getClient();
  const AIprompt = buildPrompt(language, code, error, userPrompt);
  const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineer. Always return ONLY valid JSON without markdown fences or explanations.",
        },
        {
          role: "user",
          content: AIprompt,
        },
      ],
      temperature: 0.2,
    });
  } catch (err) {
    console.error("Groq API Error:", err.message);

    if (
      err.name === "APIConnectionTimeoutError" ||
      err.code === "ETIMEDOUT" ||
      (err.message && err.message.toLowerCase().includes("timeout"))
    ) {
      const timeoutError = new Error(
        "AI analysis timed out. The model took too long to respond. Please try again."
      );
      timeoutError.status = 504;
      throw timeoutError;
    }

    if (err.status === 401) {
      const authError = new Error(
        "Invalid or unauthorized Groq API key configured on the server."
      );
      authError.status = 502;
      throw authError;
    }

    if (err.status === 429) {
      const rateLimitError = new Error(
        "AI rate limit exceeded. Please wait a few seconds and try again."
      );
      rateLimitError.status = 429;
      throw rateLimitError;
    }

    if (err.status && err.status >= 500) {
      const providerError = new Error(
        "The AI provider (Groq) is currently experiencing service issues. Please try again shortly."
      );
      providerError.status = 503;
      throw providerError;
    }

    const genericError = new Error(
      err.message || "Failed to communicate with AI service."
    );
    genericError.status = err.status || 502;
    throw genericError;
  }

  const aiResponse = completion.choices?.[0]?.message?.content;
  if (!aiResponse) {
    const emptyError = new Error("AI service returned an empty response.");
    emptyError.status = 502;
    throw emptyError;
  }

  return parseAIResponse(aiResponse);
};

module.exports = {
  analyzeWithLLM,
};
