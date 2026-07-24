const ErrorConsole = ({ error, setError }) => {
  return (
    <div className="mt-6 bg-[#18181B] border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-white">
          Error Details (Optional)
        </h2>

        <p className="text-sm text-zinc-400 mt-1">
          Paste compiler errors, stack traces, or runtime logs to improve AI analysis.
        </p>
      </div>

      <textarea
        value={error}
        onChange={(e) => setError(e.target.value)}
        placeholder="Paste error logs here..."
        className="w-full h-32 bg-[#111111] border border-zinc-800 rounded-xl p-4 text-white resize-none outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
};

export default ErrorConsole;