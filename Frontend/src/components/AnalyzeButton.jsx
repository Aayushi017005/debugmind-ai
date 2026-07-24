import { Sparkles } from "lucide-react";

const AnalyzeButton = ({ handleAnalyze, loading }) => {
  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className={`
        w-full
        py-4
        rounded-2xl
        font-semibold
        text-lg
        transition-all
        duration-300
        flex
        items-center
        justify-center
        gap-3

        ${
          loading
            ? "bg-zinc-700 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] active:scale-100 shadow-lg shadow-emerald-500/20"
        }
      `}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles size={20} />
          Analyze Code
        </>
      )}
    </button>
  );
};

export default AnalyzeButton;