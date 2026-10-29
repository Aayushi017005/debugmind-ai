import { useState, useRef, useEffect } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import {
  Copy,
  Check,
  FileCode2,
  GitCompare,
  Columns2,
  Rows2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const mapLanguage = (lang) => {
  if (!lang) return "javascript";
  const l = lang.toLowerCase().trim();
  if (l.includes("c++") || l.includes("cpp")) return "cpp";
  if (l === "c") return "c";
  if (l.includes("type")) return "typescript";
  if (l.includes("py")) return "python";
  if (l.includes("java") && !l.includes("script")) return "java";
  if (l.includes("go")) return "go";
  return "javascript";
};

const AnalysisPanel = ({ result, originalCode, loading, errorState, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const [codeViewMode, setCodeViewMode] = useState("diff"); // 'diff' or 'code'
  const [sideBySide, setSideBySide] = useState(true); // true = Split, false = Inline
  const diffEditorRef = useRef(null);

  // Keep Monaco layout synchronized when sideBySide state updates
  useEffect(() => {
    if (diffEditorRef.current) {
      try {
        diffEditorRef.current.updateOptions({ renderSideBySide: sideBySide });
        diffEditorRef.current.layout();
      } catch (_) {
        // ignore if not yet mounted
      }
    }
  }, [sideBySide]);

  const handleCopy = async () => {
    if (!result?.fixedCode) return;

    try {
      await navigator.clipboard.writeText(result.fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl shadow-xl p-8 min-h-[650px] flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 shadow-lg shadow-emerald-500/10">
          <Sparkles size={28} className="animate-spin text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Code...</h3>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          Diagnosing root causes, verifying syntax and logic, and generating an optimized solution.
        </p>
        <div className="w-48 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (errorState) {
    return (
      <div className="bg-[#18181B] border border-red-900/40 rounded-2xl shadow-xl p-8 min-h-[650px] flex flex-col justify-center">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <AlertTriangle size={30} />
          </div>

          <h3 className="text-xl font-bold text-white">
            {errorState.title || "Analysis Encountered An Issue"}
          </h3>

          <p className="text-sm text-zinc-300 leading-relaxed bg-[#111113] p-4 rounded-xl border border-zinc-800">
            {errorState.message || "An unexpected error occurred while analyzing the code."}
          </p>

          {errorState.suggestion && (
            <div className="text-xs text-zinc-400 flex items-start gap-2 text-left bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
              <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>{errorState.suggestion}</span>
            </div>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-600/20"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Empty Welcome State
  if (!result) {
    return (
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl shadow-xl p-8 min-h-[650px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <FileCode2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">🧠 AI Analysis Report</h2>
        <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-6">
          Paste or write code in the editor on the left and click{" "}
          <strong className="text-emerald-400 font-semibold">Analyze Code</strong>. DebugMind will diagnose bugs, explain the root cause, provide corrected code, and highlight differences in a diff view.
        </p>

        <div className="grid grid-cols-2 gap-3 text-left w-full max-w-sm text-xs text-zinc-400">
          <div className="p-3 rounded-xl bg-[#111113] border border-zinc-800/80">
            <span className="text-emerald-400 font-semibold block mb-1">⚡ Split & Inline Diff</span>
            Compare original code vs fix side-by-side or inline
          </div>
          <div className="p-3 rounded-xl bg-[#111113] border border-zinc-800/80">
            <span className="text-emerald-400 font-semibold block mb-1">🕒 Isolated History</span>
            Stored persistently per session in PostgreSQL
          </div>
        </div>
      </div>
    );
  }

  const editorLang = mapLanguage(result.language);

  return (
    <div className="bg-[#18181B] border border-zinc-800 rounded-2xl shadow-xl p-6 min-h-[650px] overflow-auto">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🧠</span> AI Analysis Report
          </h2>
          <p className="text-zinc-400 mt-1 text-sm">
            AI-generated debugging insights, root cause analysis, and recommended fix.
          </p>
        </div>
      </div>

      <div className="space-y-7">
        {/* Language & Error Type Badges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              Detected Language
            </span>
            <p className="text-white font-medium text-base">{result.language || "Auto Detect"}</p>
          </div>

          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block mb-1">
              Error Classification
            </span>
            <p className="text-white font-medium text-base">{result.errorType || "General Issue"}</p>
          </div>
        </div>

        {/* Root Cause */}
        <div>
          <h3 className="text-yellow-400 font-semibold text-base flex items-center gap-2">
            <span>📌</span> Root Cause
          </h3>
          <div className="mt-2.5 bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-300 leading-7 whitespace-pre-line text-sm">
              {result.rootCause}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <h3 className="text-blue-400 font-semibold text-base flex items-center gap-2">
            <span>📖</span> Concise Explanation
          </h3>
          <div className="mt-2.5 bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-300 leading-7 whitespace-pre-line text-sm">
              {result.explanation}
            </p>
          </div>
        </div>

        {/* CODE & DIFF VIEW SECTION */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-green-400 font-semibold text-base flex items-center gap-2 mr-1">
                <span>💻</span> Recommended Fix
              </h3>

              {/* View Mode Selector: Diff View vs Fixed Code */}
              <div className="flex items-center bg-[#111111] p-1 rounded-lg border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setCodeViewMode("diff")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                    codeViewMode === "diff"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <GitCompare size={14} />
                  <span>Diff View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCodeViewMode("code")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                    codeViewMode === "code"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <FileCode2 size={14} />
                  <span>Fixed Code</span>
                </button>
              </div>

              {/* Layout Switcher: Split vs Inline (both buttons actively switch layout) */}
              {codeViewMode === "diff" && (
                <div className="flex items-center bg-[#111111] p-1 rounded-lg border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setSideBySide(true)}
                    title="Side-by-side comparison"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                      sideBySide
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Columns2 size={13} />
                    <span>Split</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSideBySide(false)}
                    title="Inline line-by-line comparison"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                      !sideBySide
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Rows2 size={13} />
                    <span>Inline</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-medium shadow-sm cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied ✓
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Fixed Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monaco View: DiffEditor or Single Editor */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#1e1e1e]">
            {codeViewMode === "diff" ? (
              <div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-[#111113] text-xs text-zinc-400">
                  {sideBySide ? (
                    <>
                      <span className="flex items-center gap-1.5 text-red-400/90 font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                        Original Submitted Code (Left)
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Corrected Code Fix (Right)
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-2 text-zinc-300 font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[11px]">
                        - Original / Removed
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px]">
                        + Corrected Fix
                      </span>
                    </span>
                  )}
                </div>
                <DiffEditor
                  key={`diff-editor-${sideBySide ? "split" : "inline"}-${result?.language || "default"}`}
                  height="360px"
                  language={editorLang}
                  theme="vs-dark"
                  original={originalCode || ""}
                  modified={result.fixedCode || ""}
                  onMount={(editor) => {
                    diffEditorRef.current = editor;
                    try {
                      editor.updateOptions({ renderSideBySide: sideBySide });
                    } catch (_) {}
                  }}
                  options={{
                    readOnly: true,
                    renderSideBySide: sideBySide,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    wordWrap: "on",
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>
            ) : (
              <Editor
                height="340px"
                language={editorLang}
                theme="vs-dark"
                value={result.fixedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: { top: 12, bottom: 12 },
                }}
              />
            )}
          </div>
        </div>

        {/* Alternative Fix */}
        {result.alternativeFix && (
          <div>
            <h3 className="text-purple-400 font-semibold text-base flex items-center gap-2">
              <span>💡</span> Alternative Approach
            </h3>
            <div className="mt-2.5 bg-[#111111] border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-300 leading-7 whitespace-pre-line text-sm font-mono bg-black/40 p-3 rounded-lg border border-zinc-800/80 overflow-x-auto">
                {result.alternativeFix}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {result.summary && (
          <div>
            <h3 className="text-cyan-400 font-semibold text-base flex items-center gap-2">
              <span>📝</span> Summary
            </h3>
            <div className="mt-2.5 bg-[#111111] border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-300 leading-7 text-sm">{result.summary}</p>
            </div>
          </div>
        )}

        {/* Best Practices */}
        {result.bestPractices && result.bestPractices.length > 0 && (
          <div>
            <h3 className="text-cyan-400 font-semibold text-base mb-3 flex items-center gap-2">
              <span>⭐</span> Recommended Best Practices
            </h3>
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
              <ul className="space-y-3">
                {result.bestPractices.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-zinc-300 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
