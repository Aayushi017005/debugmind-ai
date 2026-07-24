import { BrainCircuit, Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111111]/90 backdrop-blur-xl">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        {/* Left */}
        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
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
              Understand • Debug • Improve
            </p>
          </div>

        </div>

        {/* Right */}

        <div className="hidden md:flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">

          <Sparkles
            size={16}
            className="text-emerald-400"
          />

          <span className="text-sm font-medium text-zinc-200">
            Qwen2.5-Coder 3B via Ollama
          </span>

        </div>

      </div>

    </header>
  );
};

export default Navbar;