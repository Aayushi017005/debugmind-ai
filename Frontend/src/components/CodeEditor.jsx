import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, language }) => {
  return (
    <div className="bg-[#18181B] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#111111]">

        <div>
          <h2 className="text-lg font-semibold text-white">
            Code Editor
          </h2>

          <p className="text-sm text-zinc-400 mt-1">
            Write, paste or edit your source code for AI analysis
          </p>
        </div>

       <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
  {language}
</span>

      </div>

      {/* Editor */}
      <Editor
        height="520px"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 15,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          roundedSelection: true,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          lineNumbersMinChars: 3,
          padding: {
            top: 18,
            bottom: 18,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;




