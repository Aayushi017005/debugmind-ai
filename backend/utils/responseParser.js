const parseAIResponse = (response) => {
  try {
    if (!response || typeof response !== "string") {
      throw new Error("Empty or invalid AI response string.");
    }

    let cleaned = response.trim();

    // Remove markdown code fences
    cleaned = cleaned.replace(/```json/gi, "");
    cleaned = cleaned.replace(/```/g, "");

    // Extract outermost JSON block if surrounded by extraneous text
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Convert template literal code blocks into JSON strings if present
    cleaned = cleaned.replace(
      /"fixedCode"\s*:\s*`([\s\S]*?)`/g,
      (_, code) => `"fixedCode": ${JSON.stringify(code.trim())}`
    );

    cleaned = cleaned.replace(
      /"alternativeFix"\s*:\s*`([\s\S]*?)`/g,
      (_, code) => `"alternativeFix": ${JSON.stringify(code.trim())}`
    );

    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*}/g, "}");
    cleaned = cleaned.replace(/,\s*]/g, "]");

    const parsed = JSON.parse(cleaned);

    return {
      language: parsed.language || "Unknown",
      errorType: parsed.errorType || "Unknown",
      rootCause: parsed.rootCause || "No root cause identified.",
      explanation: parsed.explanation || "No explanation provided.",
      fixedCode: parsed.fixedCode || "",
      alternativeFix: parsed.alternativeFix || "",
      summary: parsed.summary || "",
      bestPractices: Array.isArray(parsed.bestPractices) ? parsed.bestPractices : [],
    };
  } catch (err) {
    console.error("JSON Parse Error:", err.message);

    return {
      language: "Unknown",
      errorType: "Unknown",
      rootCause: "Unable to parse AI response into standard JSON format.",
      explanation: response || "No response received.",
      fixedCode: "",
      alternativeFix: "",
      summary: "",
      bestPractices: [],
    };
  }
};

module.exports = parseAIResponse;
