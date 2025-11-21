# UGC Blogging Platform

**Course:** Web Technologies 2025
**Project Type:** Mini Project - Wireframe Design

## Project Overview
This project is a User Generated Content (UGC) Blogging Platform. It serves as a central hub where users can publish their own blogs, upload multimedia content, and view curated feeds. The platform bridges the gap between traditional blogging and social media by intelligently importing text from social streams based on matching interests and hashtags.

## Key Features

* **User Authentication:** Secure Sign-in options including support for Google, Apple, and standard Email/Phone login.
* **Dynamic Home Feed:** A "UGC Blog Central" dashboard displaying recent posts and new content updates.
* **Social Media Integration:** The platform imports text from social media sources that matches registered user interests or specific hashtags.
* **Content Creation:** A dedicated "New Post" interface featuring custom title inputs and drag-and-drop functionality for images and videos.
* **Search and Discovery:** Users can search for specific hashtags to filter content.
* **User Dashboard:** A personal profile section to manage "My posts" and view previous submission history.

## Tech Stack
*(Note: Update this section with the actual technologies used in your code)*

* **Frontend:** HTML5, CSS3, JavaScript (React.js)
* **Backend:** Node.js / Express.js
* **Database:** MongoDB

## 🚀 How to Run the Project Locally

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/your-username/your-blog-repo.git
cd your-blog-repo (you must have a directory in some folder beforehand)

# 2. Install dependencies for both backend and frontend
npm install

# 3. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env   # if frontend needs env vars

# Edit the .env files with your values (MongoDB URL, JWT secret, etc.)

# 4. Start both backend + frontend in development mode

# Open 2 terminals using the split icon
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend
cd frontend
npm start

# 5. Open the app
# Frontend → http://localhost:3000
# API       → http://localhost:5001   (or whatever port you set)
