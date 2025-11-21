// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const twitterRoutes = require('./routes/twitter');

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/ugcblog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected → ugcblog database'))
.catch(err => console.error('MongoDB connection error:', err));

// Post Schema & Model
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// ─────── YOUR POSTS API ROUTES ───────
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({ title, content });
    await newPost.save();
    res.json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ─────── GOOGLE SIGN-IN (Simple Demo Version) ───────
app.get('/auth/google', (req, res) => {
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=http://localhost:5001/auth/google/callback&` +
    `response_type=code&` +
    `scope=profile email`;
  res.redirect(googleUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code');

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:5001/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenRes.json();
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const user = await userRes.json();

    res.send(`
      <script>
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_LOGIN_SUCCESS',
            user: {
              displayName: "${user.name.replace(/"/g, '\\"')}",
              photoURL: "${user.picture}",
              email: "${user.email}"
            }
          }, "http://localhost:3000");
        }
        document.write("<h2>Success! Closing...</h2>");
        setTimeout(() => window.close(), 1000);
      </script>
    `);
  } catch (err) {
    res.send('Error. Close and try again.');
  }
});

// ─────── X (TWITTER) HASHTAG PULL ROUTE ───────
app.use('/api/twitter', twitterRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('UGC Blogging Platform Backend → Running on http://localhost:5001');
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`BACKEND RUNNING → http://localhost:${PORT}`);
  console.log(`Search hashtags at: http://localhost:3000`);
});