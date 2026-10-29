const { describe, it } = require("node:test");
const assert = require("node:assert");
const parseAIResponse = require("../utils/responseParser");
const buildPrompt = require("../utils/promptBuilder");

describe("Unit Tests - Response Parser", () => {
  it("should parse standard valid JSON response", () => {
    const jsonStr = JSON.stringify({
      language: "JavaScript",
      errorType: "TypeError",
      rootCause: "Cannot read property of undefined",
      explanation: "1. Variable x is undefined.\n2. Accessing property throws.",
      fixedCode: "const x = { name: 'test' };",
      alternativeFix: "if (x) { console.log(x.name); }",
      summary: "Fixed undefined reference.",
      confidence: 9,
      bestPractices: ["Use optional chaining", "Validate inputs", "Add null checks"],
    });

    const parsed = parseAIResponse(jsonStr);
    assert.strictEqual(parsed.language, "JavaScript");
    assert.strictEqual(parsed.errorType, "TypeError");
    assert.strictEqual(parsed.confidence, 9);
    assert.strictEqual(parsed.bestPractices.length, 3);
  });

  it("should strip markdown fences from AI output", () => {
    const raw = `\`\`\`json
{
  "language": "Python",
  "errorType": "IndexError",
  "rootCause": "List index out of range",
  "explanation": "Accessing index 10 in a 3-element list",
  "fixedCode": "print(arr[0])",
  "alternativeFix": "if len(arr) > 10: print(arr[10])",
  "summary": "Check list length before indexing.",
  "confidence": 8,
  "bestPractices": ["Check length", "Use exception handling", "Use slice notation"]
}
\`\`\``;

    const parsed = parseAIResponse(raw);
    assert.strictEqual(parsed.language, "Python");
    assert.strictEqual(parsed.errorType, "IndexError");
  });

  it("should extract JSON embedded within conversational text", () => {
    const validJson = JSON.stringify({
      language: "Java",
      errorType: "NullPointerException",
      rootCause: "Null object dereferenced",
      explanation: "String s is null",
      fixedCode: 'String s = "hello";',
      alternativeFix: "Optional.ofNullable(s)",
      summary: "Initialized string.",
      confidence: 10,
      bestPractices: ["Avoid raw nulls", "Use Optional", "Validate parameters"],
    });

    const conversational = `Here is the debugging analysis for your code:\n${validJson}\nHope this helps!`;

    const parsed = parseAIResponse(conversational);
    assert.strictEqual(parsed.language, "Java");
    assert.strictEqual(parsed.errorType, "NullPointerException");
    assert.strictEqual(parsed.fixedCode, 'String s = "hello";');
  });

  it("should gracefully handle malformed non-JSON string", () => {
    const malformed = "I am an AI and I encountered an internal error.";
    const parsed = parseAIResponse(malformed);

    assert.strictEqual(parsed.language, "Unknown");
    assert.strictEqual(parsed.errorType, "Unknown");
    assert.strictEqual(parsed.confidence, 0);
  });
});

describe("Unit Tests - Prompt Builder", () => {
  it("should incorporate language, code, error, and instructions into prompt", () => {
    const prompt = buildPrompt("TypeScript", "const a: number = 'str';", "Type mismatch", "Fix typing");
    assert.ok(prompt.includes("TypeScript"));
    assert.ok(prompt.includes("const a: number = 'str';"));
    assert.ok(prompt.includes("Type mismatch"));
    assert.ok(prompt.includes("Fix typing"));
  });

  it("should provide sensible defaults for missing optional fields", () => {
    const prompt = buildPrompt("", "", "", "");
    assert.ok(prompt.includes("Auto Detect"));
    assert.ok(prompt.includes("No code provided"));
    assert.ok(prompt.includes("No error message provided"));
  });
});
