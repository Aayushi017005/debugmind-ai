const { describe, it } = require("node:test");
const assert = require("node:assert");
const db = require("../config/db");
const historyService = require("../services/historyService");

describe("History Service - Resilience & Parameterized Queries", () => {
  it("should safely return null when database is disconnected without throwing", async () => {
    // When isDbConnected() is false
    const saved = await historyService.saveHistory({
      language: "JavaScript",
      code: "console.log('test')",
      analysis: { explanation: "No bug" },
      fixedCode: "console.log('test')",
    });
    assert.strictEqual(saved, null);

    const list = await historyService.getHistoryList();
    assert.strictEqual(list, null);

    const item = await historyService.getHistoryItemById(1);
    assert.strictEqual(item, null);
  });

  it("should reject non-numeric IDs cleanly", async () => {
    const item = await historyService.getHistoryItemById("not-a-number");
    assert.strictEqual(item, null);
  });

  it("should use parameterized SQL when executing queries against pool", async () => {
    // Temporarily stub db.query and db.isDbConnected
    const originalQuery = db.query;
    const originalIsConnected = db.isDbConnected;

    let executedSql = "";
    let executedParams = [];

    db.isDbConnected = () => true;
    db.query = async (sql, params) => {
      executedSql = sql;
      executedParams = params;
      return {
        rows: [{ id: 42, created_at: new Date().toISOString() }],
      };
    };

    try {
      const res = await historyService.saveHistory({
        language: "Python",
        code: "def hello(): pass",
        errorMessage: "SyntaxError",
        userPrompt: "Fix this",
        analysis: { summary: "Valid pass statement" },
        fixedCode: "def hello(): pass",
      });

      assert.strictEqual(res.id, 42);
      // Verify parameterized query placeholders $1, $2, etc. are used
      assert.ok(executedSql.includes("$1, $2, $3, $4, $5, $6"));
      // Verify params are passed as an array
      assert.strictEqual(executedParams[0], "Python");
      assert.strictEqual(executedParams[1], "def hello(): pass");
      assert.strictEqual(executedParams[2], "SyntaxError");
      assert.strictEqual(executedParams[3], "Fix this");
    } finally {
      db.query = originalQuery;
      db.isDbConnected = originalIsConnected;
    }
  });
});

