const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const PORT = process.env.PORT || 3000;

if(!OPENAI_KEY) {
    console.warn('Warning: OPENAI_API_KEY not set. /api/ai will return an error until you set it.');
}

app.post('/api/ai', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message in request body' });

    if (!OPENAI_KEY) {
        return res.status(500).json({ error: 'Server missing OPENAI_API_KEY' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: MODEL,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant for Sales Matrix e-commerce site. Keep answers concise.' },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_KEY}`
                }
            }
        );

        const reply = response.data?.choices?.[0]?.message?.content || 'No reply from AI';
        res.json({ reply });
    } catch (err) {
        console.error('AI proxy error:', err.response?.data || err.message);
        res.status(500).json({ error: 'AI provider error' });
    }
});

app.listen(PORT, () => {
    console.log(`AI proxy server running on http://localhost:${PORT}`);
});
