const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  // return all posts
  res.send('List of posts');
});

router.post('/', (req, res) => {
  // create a new post
  res.send('Post created');
});

router.get('/:id', (req, res) => {
  // return a specific post
  res.send('Single post');
});

module.exports = router;
