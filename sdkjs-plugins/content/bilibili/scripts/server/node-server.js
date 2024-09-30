import express from 'express';
import fetch from 'node-fetch'
import cors from 'cors';
const app = express();
const PORT = 3000;

// Enable CORS to allow requests from the front-end
app.use(cors());

// Route to handle search requests
app.get('/search', async (req, res) => {
  const query = req.query.q;
  console.log(query);
  try {
  const apiUrl = `https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${query}`;
    const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.bilibili.com/',
          'Origin': 'https://www.bilibili.com/',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
    
    const text = await response.text();
    console.log('Response from Bilibili API:', text);
    
    const data = JSON.parse(text);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching Bilibili API:', error);
    res.status(500).json({ error: 'Error fetching Bilibili API' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});