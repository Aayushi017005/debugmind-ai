import { useState } from "react";
import {
  History,
  X,
  RefreshCw,
  Database,
  AlertCircle,
  Clock,
  Code2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "Recent";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_) {
    return dateStr;
  }
};

const HistoryDrawer = ({
  isOpen,
  onClose,
  historyList,
  onSelectItem,
  loading,
  onRefresh,
  dbConnected,
  activeId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content */}
      <div className="w-full max-w-md bg-[#141416] border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-[#18181B]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Debugging History</h2>
              <p className="text-xs text-zinc-400">
                View & restore previous code analyses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh history"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-emerald-400" : ""}
              />
            </button>
            <button
              onClick={onClose}
              title="Close history"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Database Status Banner */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-[#111113]">
          {dbConnected === true ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Database size={14} className="text-emerald-400" />
              <span>PostgreSQL Connected (Persistent Storage)</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">PostgreSQL Not Connected</span>
                <span className="text-zinc-400">
                  Using local session storage. Configure{" "}
                  <code className="text-amber-300 text-[11px]">DATABASE_URL</code> in{" "}
                  <code className="text-amber-300 text-[11px]">backend/.env</code> for
                  cloud PostgreSQL persistence.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && historyList.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading history...
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              <History size={32} className="mx-auto text-zinc-600 mb-2" />
              <p className="font-medium text-zinc-400">No debugging sessions yet</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Analyze your code to automatically save debugging records here.
              </p>
            </div>
          ) : (
            historyList.map((item) => {
              const isActive = activeId === item.id;
              const errorLabel =
                item.error_type ||
                item.analysis?.errorType ||
                (item.error_message ? "Error Logged" : "Analysis");

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                      : "bg-[#18181B] border-zinc-800 hover:border-zinc-700 hover:bg-[#1f1f23]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {item.language || "Code"}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          errorLabel === "No Error"
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {errorLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Clock size={12} />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {item.summary ||
                      item.root_cause ||
                      item.analysis?.summary ||
                      item.analysis?.rootCause ||
                      item.error_message ||
                      "Code analysis completed."}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/60">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Code2 size={13} className="text-zinc-400" />
                      {item.code ? `${item.code.split("\n").length} lines` : "Saved analysis"}
                    </span>

                    <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium text-[11px]">
                      Restore <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#18181B] text-center text-xs text-zinc-500">
          Showing {historyList.length} past debugging {historyList.length === 1 ? "session" : "sessions"}
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;

