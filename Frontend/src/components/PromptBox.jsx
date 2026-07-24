 const PromptBox = ({ userPrompt, setUserPrompt }) => {
  return (
    <div className="mt-6">

      <div className="mb-3">
        <h2 className="text-lg font-semibold text-white">
          Ask AI
        </h2>

        <p className="text-sm text-zinc-400 mt-1">
          Add optional instructions for the AI.
        </p>
      </div>

      <textarea
        rows={4}
       value={userPrompt}
onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Examples:
• Explain the bug step by step
• Optimize the code
• Suggest a better approach
• Improve readability
• Reduce time complexity"
        className="
          w-full
          bg-[#18181B]
          border
          border-zinc-800
          rounded-2xl
          p-4
          text-white
          placeholder:text-zinc-500
          resize-none
          outline-none
          transition-all
          duration-300
          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-500/20
        "
      />

      <p className="text-xs text-zinc-500 mt-3">
        💡 Your instructions will be included automatically when you click
        <span className="text-emerald-400 font-medium">
          {" "}Analyze Code
        </span>.
      </p>

    </div>
  );
};

export default PromptBox;