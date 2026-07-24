const parseAIResponse = (response) => {
    try {
        let cleaned = response.trim();

        // Remove markdown code fences
        cleaned = cleaned.replace(/```json/gi, "");
        cleaned = cleaned.replace(/```/g, "");

        // Convert template literal code blocks into JSON strings
        cleaned = cleaned.replace(
            /"fixedCode"\s*:\s*`([\s\S]*?)`/g,
            (_, code) =>
            `"fixedCode": ${JSON.stringify(code.trim())}`
        );

        cleaned = cleaned.replace(
            /"alternativeFix"\s*:\s*`([\s\S]*?)`/g,
            (_, code) =>
            `"alternativeFix": ${JSON.stringify(code.trim())}`
        );

        // Remove trailing commas
        cleaned = cleaned.replace(/,\s*}/g, "}");
        cleaned = cleaned.replace(/,\s*]/g, "]");

        return JSON.parse(cleaned);

    } catch (err) {

        console.error("JSON Parse Error:", err);

        return {
            language: "Unknown",
            errorType: "Unknown",
            rootCause: "Unable to parse AI response.",
            explanation: response,
            fixedCode: "",
            alternativeFix: "",
            summary: "",
            confidence: 0,
            bestPractices: [],
        };
    }
};

module.exports = parseAIResponse;