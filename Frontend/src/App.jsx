import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar";
import LanguageSelector from "./components/LanguageSelector";
import CodeEditor from "./components/CodeEditor";
import PromptBox from "./components/PromptBox";
import ErrorConsole from "./components/ErrorConsole";
import AnalyzeButton from "./components/AnalyzeButton";
import AnalysisPanel from "./components/AnalysisPanel";
import HistoryDrawer from "./components/HistoryDrawer";
import Footer from "./components/Footer";

import { analyzeCode, fetchHistory, fetchHistoryItem } from "./services/api";

const LOCAL_STORAGE_KEY = "debugmind_local_history_v1";

function App() {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // Load history from backend PostgreSQL (fallback to localStorage if DB unavailable)
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchHistory(30);
      setDbConnected(data.dbConnected ?? false);

      if (data.dbConnected && Array.isArray(data.history) && data.history.length > 0) {
        setHistoryList(data.history);
      } else {
        // Fallback to local session history
        const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedLocal) {
          try {
            setHistoryList(JSON.parse(savedLocal));
          } catch (_) {
            setHistoryList([]);
          }
        } else {
          setHistoryList(data.history || []);
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote history, falling back to local storage:", err.message);
      setDbConnected(false);
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedLocal) {
        try {
          setHistoryList(JSON.parse(savedLocal));
        } catch (_) {
          setHistoryList([]);
        }
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveToLocalHistory = (item) => {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      let list = existing ? JSON.parse(existing) : [];
      list = [item, ...list.filter((x) => x.id !== item.id)].slice(0, 30);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch (e) {
      console.warn("Local storage write error:", e);
      return [];
    }
  };

  const handleAnalyze = async () => {
    if (!code || !code.trim()) {
      toast.error("Please enter some code to analyze.");
      return;
    }

    setLoading(true);
    setErrorState(null);

    try {
      const data = await analyzeCode({
        language,
        code,
        error,
        userPrompt,
      });

      setResult(data);
      toast.success("Analysis completed successfully!");

      // Record in local history session immediately
      const historyRecord = {
        id: data.historyId || Date.now(),
        language: data.language || language,
        code,
        error_message: error || null,
        user_prompt: userPrompt || null,
        error_type: data.errorType || "Analysis",
        summary: data.summary || data.rootCause || "Code analyzed",
        root_cause: data.rootCause,
        analysis: data,
        fixed_code: data.fixedCode,
        created_at: new Date().toISOString(),
      };

      const updatedLocal = saveToLocalHistory(historyRecord);
      setHistoryList((prev) => [historyRecord, ...prev.filter((p) => p.id !== historyRecord.id)]);
      setActiveHistoryId(historyRecord.id);

      // If DB is connected, reload remote history in the background
      if (dbConnected) {
        loadHistory();
      }
    } catch (err) {
      console.error("Analysis Error:", err);

      let title = "Analysis Failed";
      let message = "An unexpected error occurred while analyzing the code.";
      let suggestion = "Please check your network and try again.";

      if (err.code === "ECONNABORTED" || err.response?.status === 504) {
        title = "Request Timed Out";
        message =
          err.response?.data?.message ||
          "The AI request timed out. Groq took longer than 30 seconds to analyze this code.";
        suggestion =
          "Try simplifying the code or shortening any large error logs.";
        toast.error("Analysis timed out. Please try again.");
      } else if (err.response?.status === 429) {
        title = "Rate Limit Exceeded";
        message =
          err.response?.data?.message ||
          "Groq API rate limit reached. Please wait a few moments.";
        suggestion = "Wait 15-30 seconds before submitting another request.";
        toast.error("Rate limit reached. Please wait.");
      } else if (err.response?.status === 400) {
        title = "Invalid Request";
        message = err.response?.data?.message || "Invalid code submission.";
        suggestion = "Ensure you have pasted valid source code.";
        toast.error(message);
      } else if (err.code === "ERR_NETWORK" || !err.response) {
        title = "Backend Server Unreachable";
        message =
          "Cannot reach the DebugMind backend server. Please make sure the backend is running.";
        suggestion =
          "Ensure the Express backend is running on port 5000 (npm start).";
        toast.error("Backend server unreachable.");
      } else {
        message = err.response?.data?.message || message;
        toast.error(message);
      }

      setErrorState({ title, message, suggestion });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = async (item) => {
    try {
      setActiveHistoryId(item.id);

      // If full code is not in list item, try fetching full item from backend
      let fullItem = item;
      if (!fullItem.code && dbConnected && typeof item.id === "number") {
        try {
          const res = await fetchHistoryItem(item.id);
          if (res?.item) {
            fullItem = res.item;
          }
        } catch (_) {
          // fall back to existing item data
        }
      }

      if (fullItem.code) {
        setCode(fullItem.code);
      }
      if (fullItem.language) {
        setLanguage(fullItem.language);
      }
      if (fullItem.error_message !== undefined) {
        setError(fullItem.error_message || "");
      }
      if (fullItem.user_prompt !== undefined) {
        setUserPrompt(fullItem.user_prompt || "");
      }

      // Restore analysis result
      const restoredAnalysis =
        fullItem.analysis || {
          language: fullItem.language,
          errorType: fullItem.error_type || "Restored",
          rootCause: fullItem.root_cause || fullItem.summary || "",
          explanation: fullItem.summary || "",
          fixedCode: fullItem.fixed_code || "",
          summary: fullItem.summary || "",
          confidence: 10,
          bestPractices: [],
        };

      setResult(restoredAnalysis);
      setErrorState(null);
      setIsHistoryOpen(false);
      toast.success("Loaded previous analysis from history!");
    } catch (e) {
      console.error("Failed to load history item:", e);
      toast.error("Failed to load historical record.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col justify-between">
      <div>
        {/* Navbar with History trigger */}
        <Navbar
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={historyList.length}
        />

        {/* Main Layout Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Column: Inputs & Editor */}
          <div className="flex flex-col gap-4">
            <LanguageSelector language={language} setLanguage={setLanguage} />

            <CodeEditor code={code} setCode={setCode} language={language} />

            <PromptBox
              prompt={userPrompt}
              setPrompt={setUserPrompt}
              userPrompt={userPrompt}
              setUserPrompt={setUserPrompt}
            />

            <ErrorConsole error={error} setError={setError} />

            <div className="pt-2">
              <AnalyzeButton handleAnalyze={handleAnalyze} loading={loading} />
            </div>
          </div>

          {/* Right Column: Analysis Panel with Diff View */}
          <div>
            <AnalysisPanel
              result={result}
              originalCode={code}
              loading={loading}
              errorState={errorState}
              onRetry={handleAnalyze}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Slide-over Debugging History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onSelectItem={handleSelectHistoryItem}
        loading={historyLoading}
        onRefresh={loadHistory}
        dbConnected={dbConnected}
        activeId={activeHistoryId}
      />
    </div>
  );
}

export default App;
