import Footer from "./components/Footer";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import LanguageSelector from "./components/LanguageSelector";
import CodeEditor from "./components/CodeEditor";
import PromptBox from "./components/PromptBox";
import ErrorConsole from "./components/ErrorConsole";
import AnalyzeButton from "./components/AnalyzeButton";
import AnalysisPanel from "./components/AnalysisPanel";

function App() {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "https://debugmind-backend.onrender.com/api/bugs/analyze",
        {
          language,
          code,
          error,
          userPrompt,
        }
      );

     setResult(response.data);
toast.success("Analysis completed successfully!");
    } catch (err) {
      console.error(err);
toast.error("Analysis failed. Please try again.");
      setResult({
        language: "Unknown",
        errorType: "Error",
        rootCause: "Unable to analyze the code.",
        explanation:
          "Unable to connect to the AI service. Please try again later.",
        fixedCode: "",
        alternativeFix: "",
        summary: "",
        confidence: "0",
        bestPractices: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">

      {/* Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="grid grid-cols-2 gap-6 p-6">

        {/* Left Panel */}
        <div>

          <LanguageSelector
            language={language}
            setLanguage={setLanguage}
          />

          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
          />

          <PromptBox
            prompt={userPrompt}
            setPrompt={setUserPrompt}
          />

        </div>

        {/* Right Panel */}
        <AnalysisPanel
          result={result}
        />

      </div>

      {/* Error Console */}
      <div className="px-6">
        <ErrorConsole
          error={error}
          setError={setError}
        />
      </div>

      {/* Analyze Button */}
      <div className="px-6 py-6">
        <AnalyzeButton
          handleAnalyze={handleAnalyze}
          loading={loading}
        />
        <Footer />
      </div>

    </div>
  );
}

export default App;