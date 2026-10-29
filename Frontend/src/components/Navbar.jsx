import { BrainCircuit, History } from "lucide-react";

const Navbar = ({ onOpenHistory, historyCount = 0 }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#111111]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-lg shadow-emerald-500/10">
            <BrainCircuit size={26} className="text-emerald-400" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              DebugMind AI
            </h1>
            <p className="text-xs text-zinc-400">
              AI-Powered Code Analysis, Instant Diff & Bug Resolution
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-200 hover:text-white transition text-xs font-medium cursor-pointer shadow-sm"
          >
            <History size={15} className="text-emerald-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <div className="hidden md:flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-zinc-200">
              Powered by <span className="text-emerald-400 font-semibold">Groq AI</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
