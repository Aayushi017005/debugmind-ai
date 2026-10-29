const db = require("../config/db");

const saveHistory = async ({
  sessionId,
  language,
  code,
  errorMessage,
  userPrompt,
  analysis,
  fixedCode,
}) => {
  if (!db.isDbConnected()) {
    return null;
  }

  const sql = `
    INSERT INTO debug_history (session_id, language, code, error_message, user_prompt, analysis, fixed_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, session_id, created_at;
  `;

  const values = [
    sessionId || null,
    language || "Auto Detect",
    code,
    errorMessage || null,
    userPrompt || null,
    typeof analysis === "object" ? JSON.stringify(analysis) : analysis,
    fixedCode || "",
  ];

  const result = await db.query(sql, values);
  return result?.rows?.[0] || null;
};

const getHistoryList = async (sessionId, limit = 30) => {
  if (!db.isDbConnected() || !sessionId) {
    return [];
  }

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

  const sql = `
    SELECT 
      id,
      session_id,
      language,
      error_message,
      user_prompt,
      analysis->>'errorType' AS error_type,
      analysis->>'summary' AS summary,
      analysis->>'rootCause' AS root_cause,
      created_at
    FROM debug_history
    WHERE session_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;

  const result = await db.query(sql, [sessionId, safeLimit]);
  return result?.rows || [];
};

const getHistoryItemById = async (id, sessionId) => {
  if (!db.isDbConnected() || !sessionId) {
    return null;
  }

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return null;
  }

  const sql = `
    SELECT 
      id,
      session_id,
      language,
      code,
      error_message,
      user_prompt,
      analysis,
      fixed_code,
      created_at
    FROM debug_history
    WHERE id = $1 AND session_id = $2;
  `;

  const result = await db.query(sql, [parsedId, sessionId]);
  if (!result || !result.rows || result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  if (typeof row.analysis === "string") {
    try {
      row.analysis = JSON.parse(row.analysis);
    } catch (_) {
      // keep raw if not JSON
    }
  }

  return row;
};

module.exports = {
  saveHistory,
  getHistoryList,
  getHistoryItemById,
};
