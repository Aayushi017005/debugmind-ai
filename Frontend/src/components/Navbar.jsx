import { BrainCircuit } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111111]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-lg shadow-emerald-500/10">
            <BrainCircuit
              size={28}
              className="text-emerald-400"
            />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              DebugMind AI
            </h1>

            <p className="text-sm text-zinc-400">
              AI-Powered Code Analysis & Bug Resolution
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>

          <span className="text-sm font-medium text-zinc-200">
            Powered by <span className="text-emerald-400 font-semibold">Groq AI</span>
          </span>
        </div>

      </div>
    </header>
  );
};

export default Navbar;