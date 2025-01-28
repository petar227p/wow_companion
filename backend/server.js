const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Učitavanje .env datoteke

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: 'http://localhost:5173', // Frontend port
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));

const CLIENT_ID = process.env.BNET_CLIENT_ID;
const CLIENT_SECRET = process.env.BNET_CLIENT_SECRET;

async function fetchWithRetry(url, options, retries = 3, backoff = 300) {
  try {
    return await axios.get(url, options);
  } catch (error) {
    if (retries > 0 && error.response?.status === 503) {
      console.warn(`Retrying request... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

// Dohvaćanje OAuth tokena
app.get('/get-token', async (req, res) => {
  try {
    const response = await axios.post('https://oauth.battle.net/token', null, {
      params: {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
    });

    const { access_token } = response.data;
    res.json({ access_token });
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).send('Error fetching token');
  }
});

// Dodaj `/auth/bnet` rutu
app.get('/auth/bnet', (req, res) => {
  const state = generateRandomString();
  const authUrl = `https://oauth.battle.net/authorize?client_id=${CLIENT_ID}&redirect_uri=http://localhost:5000/callback&response_type=code&scope=openid+wow.profile&state=${state}`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post('https://oauth.battle.net/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:5000/callback',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
    });

    const { access_token } = response.data;

    // Fetch user info
    const userInfoResponse = await axios.get('https://oauth.battle.net/oauth/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Redirect to another page and include user data as query parameters
    res.redirect(`http://localhost:5173/home?token=${access_token}&battletag=${userInfoResponse.data.battletag}`);
  } catch (error) {
    console.error('Error during Battle.net OAuth:', error);
    res.status(500).send('Authentication failed');
  }
});

// Dohvaćanje popisa likova korisnika
app.get('/characters', async (req, res) => {
  const token = req.query.token;

  try {
    const response = await fetchWithRetry('https://eu.api.blizzard.com/profile/user/wow', {
      params: {
        namespace: 'profile-eu',
        locale: 'en_GB',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching characters list from Blizzard API:', error.message);
    console.error('Error details:', error.response?.data);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).send(`Error fetching characters list: ${error.message}`);
  }
});

// Dohvaćanje podataka o liku
app.get('/character', async (req, res) => {
  const { realm, characterName } = req.query;
  const token = req.query.token;

  try {
    const response = await fetchWithRetry(`https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName}`, {
      params: {
        namespace: 'profile-eu',
        locale: 'en_GB',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching character data:', error.message);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    res.status(500).send(`Error fetching character data: ${error.message}`);
  }
});

// Dohvaćanje karakter rendera
app.get('/character/media', async (req, res) => {
  const { realm, characterName } = req.query;
  const token = req.query.token;

  try {
    const response = await fetchWithRetry(`https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName}/character-media`, {
      params: {
        namespace: 'profile-eu',
        locale: 'en_GB',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching character media:', error.message);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    res.status(500).send(`Error fetching character media: ${error.message}`);
  }
});

// Dohvaćanje opreme lika
app.get('/character/equipment', async (req, res) => {
  const { realm, characterName } = req.query;
  const token = req.query.token;

  try {
    const response = await fetchWithRetry(`https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName}/equipment`, {
      params: {
        namespace: 'profile-eu',
        locale: 'en_GB',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching character equipment:', error.message);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    res.status(500).send(`Error fetching character equipment: ${error.message}`);
  }
});

// Dohvaćanje podataka iz aukcijske kuće s paginacijom
app.get('/auctionhouse', async (req, res) => {
  const token = req.query.token;
  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;

  try {
    const response = await fetchWithRetry('https://eu.api.blizzard.com/data/wow/connected-realm/1403/auctions', {
      params: {
        namespace: 'dynamic-eu',
        locale: 'en_GB',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const auctionData = response.data.auctions;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = auctionData.slice(startIndex, endIndex);

    res.json({ auctions: paginatedData, total: auctionData.length });
  } catch (error) {
    console.error('Error fetching auction house data:', error.message);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    res.status(500).send(`Error fetching auction house data: ${error.message}`);
  }
});

app.get('/item', async (req, res) => {
  const{itemId, token} = req.query;

  try {
    const response = await fetchWithRetry(`https://eu.api.blizzard.com/data/wow/item/${itemId}`, {
      params: {
        namespace: 'static-eu',
        locale: 'en_GB',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching item data:', error.message);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    res.status(500).send(`Error fetching item data: ${error.message}`);
  }
});



// Dohvaćanje medija predmeta
app.get('/item/media', async (req, res) => {
  const { itemId, token } = req.query;

  try {
    const response = await fetchWithRetry(`https://eu.api.blizzard.com/data/wow/media/item/${itemId}`, {
      params: {
        namespace: 'static-eu',
        locale: 'en_GB',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching item media:', error.message);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    res.status(500).send(`Error fetching item media: ${error.message}`);
  }
});

const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});

// Helper function to generate a random string for the state parameter
function generateRandomString() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}