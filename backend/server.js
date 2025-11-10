const express = require('express');
const mongoose = require('mongoose'); // Import mongoose

const app = express();

// Connect to MongoDB before defining routes
mongoose.connect('mongodb://localhost:27017/blog', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes after database connection
const postsRoutes = require('./routes/posts.routes');
app.use('/posts', postsRoutes);

// ... other routes, middleware, error handling

app.listen(3001, () => {
  console.log('Server running at http://localhost:3001');
});
