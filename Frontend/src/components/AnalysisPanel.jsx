import { useState } from "react";
import Editor from "@monaco-editor/react";

const AnalysisPanel = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.fixedCode) return;

    try {
      await navigator.clipboard.writeText(result.fixedCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  if (!result) {
    return (
      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl shadow-xl p-6 min-h-[650px]">
        <h2 className="text-2xl font-bold text-white mb-2">
          🧠 AI Analysis Report
        </h2>

        <p className="text-zinc-400">
          Submit your code to receive AI-powered debugging insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#18181B] border border-zinc-800 rounded-2xl shadow-xl p-6 min-h-[650px] overflow-auto">

      {/* Header */}

      <div className="border-b border-zinc-800 pb-5 mb-6">
        <h2 className="text-2xl font-bold text-white">
          🧠 AI Analysis Report
        </h2>

        <p className="text-zinc-400 mt-2 text-sm">
          AI-generated debugging insights and recommended solution.
        </p>
      </div>

      <div className="space-y-7">

        {/* Language */}

        <div>
          <h3 className="text-emerald-400 font-semibold text-lg">
            🌐 Language
          </h3>

          <div className="mt-3 bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-300">
              {result.language}
            </p>
          </div>
        </div>

        {/* Error Type */}

        <div>
          <h3 className="text-red-400 font-semibold text-lg">
            ❌ Error Type
          </h3>

          <div className="mt-3 bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-300">
              {result.errorType}
            </p>
          </div>
        </div>

        {/* Root Cause */}

        <div>
          <h3 className="text-yellow-400 font-semibold text-lg">
            📌 Root Cause
          </h3>

          <div className="mt-3 bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-300 leading-7 whitespace-pre-line">
              {result.rootCause}
            </p>
          </div>
        </div>

        {/* Explanation */}

        <div>
          <h3 className="text-blue-400 font-semibold text-lg">
            📖 Explanation
          </h3>

          <div className="mt-3 bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-300 leading-7 whitespace-pre-line">
              {result.explanation}
            </p>
          </div>
        </div>

        {/* Fixed Code */}

        <div>

          <div className="flex justify-between items-center">

            <h3 className="text-green-400 font-semibold text-lg">
              💻 Fixed Code
            </h3>

            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition font-medium"
            >
              {copied ? "Copied ✓" : "Copy Code"}
            </button>

          </div>

          <div className="mt-4 border border-zinc-800 rounded-xl overflow-hidden">

            <Editor
              height="260px"
              language={result.language?.toLowerCase() || "javascript"}
              theme="vs-dark"
              value={result.fixedCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                fontSize: 15,
              }}
            />

          </div>

        </div>

        {/* Alternative Fix */}

        <div>
          <h3 className="text-purple-400 font-semibold text-lg">
            💡 Alternative Fix
          </h3>

          <div className="mt-3 bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-300 leading-7 whitespace-pre-line">
              {result.alternativeFix}
            </p>
          </div>
        </div>

        {/* Summary */}

        {result.summary && (
          <div>
              <h3 className="flex items-center gap-2 text-cyan-400 font-semibold text-lg">
    📝 Summary
  </h3>

  <div className="mt-3 bg-[#111111] border border-zinc-800 rounded-xl p-4">
    <p className="text-zinc-300 leading-7">
                {result.summary}
              </p>
            </div>
          </div>
        )}

        {/* Confidence */}

        <div>

          <h3 className="text-orange-400 font-semibold text-lg mb-4">
            🎯 Confidence
          </h3>

          <div className="flex justify-between mb-2">

            <span className="text-zinc-400">
              AI Confidence Score
            </span>

            <span className="text-emerald-400 font-semibold">
              {result.confidence}/10
            </span>

          </div>

          <div className="w-full bg-zinc-800 rounded-full h-3">

            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${Number(result.confidence) * 10}%`,
              }}
            />

          </div>

        </div>

        {/* Best Practices */}

        <div>

          <h3 className="text-cyan-400 font-semibold text-lg mb-4">
            ⭐ Best Practices
          </h3>

          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">

            <ul className="space-y-3">

              {result.bestPractices?.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-zinc-300"
                >
                  <span className="text-emerald-400 font-bold">
                    ✔
                  </span>

                  <span>{item}</span>
                </li>
              ))}

            </ul>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AnalysisPanel;
