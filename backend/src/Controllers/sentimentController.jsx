const { spawn } = require("child_process");

const analyzeSentiment = (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    const pythonProcess = spawn("python", ["../../model/model.py", text]);

    pythonProcess.stdout.on("data", (data) => {
        res.json(JSON.parse(data.toString()));
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Error: ${data}`);
        res.status(500).json({ error: "Internal Server Error" });
    });
};

module.exports = { analyzeSentiment };
