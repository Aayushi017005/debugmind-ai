const LanguageSelector = ({ language, setLanguage }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-300 mb-2 font-medium">
        Programming Language
      </label>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-full bg-[#161b22] border border-gray-700 rounded-lg p-3 text-white"
      >
        <option>JavaScript</option>
        <option>Python</option>
        <option>Java</option>
        <option>C++</option>
        <option>C</option>
        <option>TypeScript</option>
        <option>Go</option>
      </select>
    </div>
  );
};
export default LanguageSelector;