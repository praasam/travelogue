const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/analyze-sentiment', async (req, res) => {
    const { text } = req.body;  // Extract text from the request body

    try {
        const response = await axios.post('http://127.0.0.1:5000/analyze', { text });
        res.json(response.data);  // Send back sentiment analysis result
    } catch (error) {
        console.error('Error calling Python API:', error);
        res.status(500).send('Error processing sentiment analysis');
    }
});

module.exports = router;
