const { analyzeWithLLM } = require("../services/llmService");

const analyzeBug = async(req, res) => {
    try {
        const { language, code, error, userPrompt } = req.body;

        const result = await analyzeWithLLM(language, code, error, userPrompt);

        res.json(result);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Something went wrong.",
        });
    }
};

module.exports = {
    analyzeBug,
};