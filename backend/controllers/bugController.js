const llmService = require("../services/llmService");
const {
  saveHistory,
  getHistoryList,
  getHistoryItemById,
} = require("../services/historyService");
const { isDbConnected } = require("../config/db");

const MAX_CODE_LENGTH = 50000;

const isValidSessionId = (sid) => {
  return typeof sid === "string" && /^[a-zA-Z0-9_-]{10,100}$/.test(sid.trim());
};

const extractSessionId = (req) => {
  const headerId = req.headers["x-session-id"];
  if (headerId && typeof headerId === "string") return headerId.trim();
  const queryId = req.query?.sessionId;
  if (queryId && typeof queryId === "string") return queryId.trim();
  const bodyId = req.body?.sessionId;
  if (bodyId && typeof bodyId === "string") return bodyId.trim();
  return null;
};

const analyzeBug = async (req, res) => {
  try {
    const { language, code, error, userPrompt } = req.body || {};
    const sessionId = extractSessionId(req);

    // Input Validation
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Source code is required for analysis.",
      });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        error: "Validation Error",
        message: `Code length exceeds maximum allowed limit (${MAX_CODE_LENGTH} characters).`,
      });
    }

    const sanitizedLanguage =
      typeof language === "string" && language.trim()
        ? language.trim().slice(0, 50)
        : "Auto Detect";

    const sanitizedError =
      typeof error === "string" && error.trim() ? error.trim() : "";

    const sanitizedPrompt =
      typeof userPrompt === "string" && userPrompt.trim()
        ? userPrompt.trim()
        : "";

    // Call LLM
    const result = await llmService.analyzeWithLLM(
      sanitizedLanguage,
      code,
      sanitizedError,
      sanitizedPrompt
    );

    // Save to persistent PostgreSQL history if database is available and sessionId is valid
    let historyEntry = null;
    try {
      if (isDbConnected() && isValidSessionId(sessionId)) {
        historyEntry = await saveHistory({
          sessionId,
          language: result.language || sanitizedLanguage,
          code,
          errorMessage: sanitizedError || null,
          userPrompt: sanitizedPrompt || null,
          analysis: result,
          fixedCode: result.fixedCode || "",
        });
      }
    } catch (dbErr) {
      console.warn("Notice: Failed to persist analysis to PostgreSQL:", dbErr.message);
    }

    return res.status(200).json({
      ...result,
      historySaved: !!historyEntry,
      historyId: historyEntry ? historyEntry.id : null,
      sessionId: historyEntry ? historyEntry.session_id : sessionId || null,
    });
  } catch (err) {
    console.error("Analysis Controller Error:", err.message);

    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    return res.status(status).json({
      error: err.name || "Analysis Error",
      message: err.message || "Something went wrong during code analysis.",
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const sessionId = extractSessionId(req);

    if (!isValidSessionId(sessionId)) {
      return res.status(400).json({
        error: "Validation Error",
        message:
          "A valid session ID (10-100 alphanumeric characters, dashes, or underscores) is required to access history.",
        history: [],
      });
    }

    if (!isDbConnected()) {
      return res.status(200).json({
        history: [],
        dbConnected: false,
        message:
          "PostgreSQL is not configured or unavailable. Set DATABASE_URL in .env to enable persistent history.",
      });
    }

    const limit = parseInt(req.query.limit, 10) || 30;
    const history = await getHistoryList(sessionId, limit);

    return res.status(200).json({
      history: history || [],
      dbConnected: true,
      sessionId,
    });
  } catch (err) {
    console.error("Get History Controller Error:", err.message);
    return res.status(500).json({
      error: "Database Error",
      message: "Failed to retrieve debugging history.",
    });
  }
};

const getHistoryItem = async (req, res) => {
  try {
    const sessionId = extractSessionId(req);

    if (!isValidSessionId(sessionId)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "A valid session ID is required to retrieve history entry details.",
      });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid history ID. Must be a positive integer.",
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: "Database Unavailable",
        message:
          "PostgreSQL is not configured or unavailable. Set DATABASE_URL in .env to view historical records.",
      });
    }

    const item = await getHistoryItemById(id, sessionId);
    if (!item) {
      return res.status(404).json({
        error: "Not Found",
        message: `History entry with ID ${id} was not found for this session.`,
      });
    }

    return res.status(200).json({
      item,
      dbConnected: true,
    });
  } catch (err) {
    console.error("Get History Item Controller Error:", err.message);
    return res.status(500).json({
      error: "Database Error",
      message: "Failed to retrieve history entry details.",
    });
  }
};

module.exports = {
  analyzeBug,
  getHistory,
  getHistoryItem,
};
