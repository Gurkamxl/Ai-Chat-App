const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  console.log('Received request from frontend');
  try {
    const { message } = req.body;
    console.log('Received message:', message);
    
    // Send request to Ollama
    console.log('Sending request to Ollama...');
    const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: "llama3.2:1b",
      prompt: message,
      stream: false  // Set to false to get the complete response at once
    }, {
      timeout: 60000 // 60 seconds timeout
    });

    console.log('Received response from Ollama:', ollamaResponse.data);
    
    if (ollamaResponse.data && ollamaResponse.data.response) {
      res.json({ response: ollamaResponse.data.response });
    } else {
      throw new Error('Unexpected response format from Ollama');
    }
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    if (error.response) {
      console.error('Ollama API responded with:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from Ollama API');
    } else {
      console.error('Error setting up the request:', error.message);
    }
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
