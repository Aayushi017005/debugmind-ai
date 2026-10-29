const buildPrompt = (language, code, error, userPrompt) => {
  return `You are an expert software engineer and code debugger. Analyze the following code and return ONLY ONE valid JSON object matching the schema below.

LANGUAGE: ${language || "Auto Detect"}
ERROR: ${error || "None reported"}
${userPrompt ? `USER INSTRUCTION: ${userPrompt}\n` : ""}
SOURCE CODE:
${code || ""}

JSON SCHEMA:
{
  "language": "detected language",
  "errorType": "concise error classification (or 'No Error')",
  "rootCause": "one direct sentence identifying the exact bug",
  "explanation": "2 to 4 concise sentences explaining the root cause, why it occurs, and how the fix resolves it without fluff or theory.",
  "fixedCode": "complete corrected code without markdown or truncation",
  "alternativeFix": "optional alternative fix or empty string",
  "summary": "1 to 2 short sentences summarizing the fix",
  "bestPractices": ["max 3 short bullet recommendations"]
}

STRICT INSTRUCTIONS:
1. Return ONLY the raw JSON object. Do not include markdown code fences, backticks, or text outside the JSON.
2. Keep "explanation" strictly to 2-4 concise sentences. Be direct: state the bug, why it occurred, and how the fix resolves it. Avoid repetition and unnecessary theory.
3. "fixedCode" MUST be complete, valid, executable code containing the fix.
4. If there is no bug, set errorType to "No Error" and return the original code in fixedCode.`;
};

module.exports = buildPrompt;
