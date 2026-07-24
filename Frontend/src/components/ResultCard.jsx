const ResultCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-5 text-gray-200">

      <div>
        <h3 className="text-blue-400 font-semibold">Language</h3>
        <p>{data.language}</p>
      </div>

      <div>
        <h3 className="text-blue-400 font-semibold">Root Cause</h3>
        <p>{data.rootCause}</p>
      </div>

      <div>
        <h3 className="text-blue-400 font-semibold">Explanation</h3>
        <p>{data.explanation}</p>
      </div>

      <div>
        <h3 className="text-blue-400 font-semibold mb-2">
          Fixed Code
        </h3>

        <pre className="bg-black rounded-lg p-4 overflow-auto whitespace-pre-wrap text-green-400">
{data.fixedCode}
        </pre>
      </div>

      <div>
        <h3 className="text-blue-400 font-semibold">
          Confidence
        </h3>
        <p>{data.confidence}/10</p>
      </div>

      <div>
        <h3 className="text-blue-400 font-semibold mb-2">
          Best Practices
        </h3>

        <ul className="list-disc ml-5 space-y-2">
          {data.bestPractices?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default ResultCard;