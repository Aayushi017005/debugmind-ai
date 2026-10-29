const { describe, it } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../server");
const llmService = require("../services/llmService");

describe("API Endpoints & Error Handling Tests", () => {
  it("GET / should return 200 with status message", async () => {
    const res = await request(app).get("/");
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes("DebugMind AI Backend Running"));
  });

  describe("POST /api/bugs/analyze - Input Validation", () => {
    it("should return 400 when code is missing", async () => {
      const res = await request(app)
        .post("/api/bugs/analyze")
        .send({ language: "JavaScript" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, "Validation Error");
      assert.ok(res.body.message.includes("Source code is required"));
    });

    it("should return 400 when code is an empty or whitespace string", async () => {
      const res = await request(app)
        .post("/api/bugs/analyze")
        .send({ code: "   \n\t  ", language: "Python" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, "Validation Error");
      assert.ok(res.body.message.includes("Source code is required"));
    });

    it("should return 400 when code exceeds maximum character limit", async () => {
      const hugeCode = "a".repeat(50001);
      const res = await request(app)
        .post("/api/bugs/analyze")
        .send({ code: hugeCode, language: "C++" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, "Validation Error");
      assert.ok(res.body.message.includes("exceeds maximum allowed limit"));
    });
  });

  describe("POST /api/bugs/analyze - Execution & Error Handling", () => {
    it("should return 200 and formatted result on successful analysis", async () => {
      // Mock analyzeWithLLM
      const originalAnalyze = llmService.analyzeWithLLM;
      llmService.analyzeWithLLM = async () => ({
        language: "JavaScript",
        errorType: "ReferenceError",
        rootCause: "Variable not declared",
        explanation: "1. foo is undefined.\n2. Declare foo before use.",
        fixedCode: "const foo = 42; console.log(foo);",
        alternativeFix: "console.log(window.foo || 42);",
        summary: "Declared missing variable.",
        confidence: 9,
        bestPractices: ["Always declare variables", "Use strict mode", "Enable linting"],
      });

      try {
        const res = await request(app)
          .post("/api/bugs/analyze")
          .send({
            code: "console.log(foo);",
            language: "JavaScript",
            error: "ReferenceError: foo is not defined",
          });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.language, "JavaScript");
        assert.strictEqual(res.body.errorType, "ReferenceError");
        assert.strictEqual(res.body.fixedCode, "const foo = 42; console.log(foo);");
        assert.strictEqual(typeof res.body.historySaved, "boolean");
      } finally {
        llmService.analyzeWithLLM = originalAnalyze;
      }
    });

    it("should return 504 when AI service times out", async () => {
      const originalAnalyze = llmService.analyzeWithLLM;
      llmService.analyzeWithLLM = async () => {
        const err = new Error("AI analysis timed out.");
        err.status = 504;
        throw err;
      };

      try {
        const res = await request(app)
          .post("/api/bugs/analyze")
          .send({ code: "let x = 1;" });

        assert.strictEqual(res.status, 504);
        assert.ok(res.body.message.includes("timed out"));
      } finally {
        llmService.analyzeWithLLM = originalAnalyze;
      }
    });

    it("should return 429 when AI service rate limits", async () => {
      const originalAnalyze = llmService.analyzeWithLLM;
      llmService.analyzeWithLLM = async () => {
        const err = new Error("AI rate limit exceeded.");
        err.status = 429;
        throw err;
      };

      try {
        const res = await request(app)
          .post("/api/bugs/analyze")
          .send({ code: "let x = 1;" });

        assert.strictEqual(res.status, 429);
        assert.ok(res.body.message.includes("rate limit"));
      } finally {
        llmService.analyzeWithLLM = originalAnalyze;
      }
    });
  });

  describe("GET /api/bugs/history - History Retrieval", () => {
    it("should gracefully return history payload when DB is offline or not configured", async () => {
      const res = await request(app).get("/api/bugs/history");
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.history));
      assert.strictEqual(typeof res.body.dbConnected, "boolean");
    });

    it("should return 400 for invalid history ID", async () => {
      const res = await request(app).get("/api/bugs/history/invalid-id");
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, "Validation Error");
    });

    it("should return 400 for negative history ID", async () => {
      const res = await request(app).get("/api/bugs/history/-5");
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, "Validation Error");
    });
  });
});

