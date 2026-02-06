# Realtime Notes App (Backend)

A **Node.js + Express backend** for a Realtime Notes App with authentication, notes management, search, and shareable links. Uses **MySQL** as database (Railway) and JWT for authentication. Ready to deploy on **Render**.

---

## **Features**

- User Authentication (Register/Login)
- JWT-based authorization
- Notes CRUD (Create, Read, Update, Delete) with **user ownership**
- Search notes by title or content
- Shareable **read-only links**
- Activity logs (optional)
- Fully deployed backend on Render

---

## **Tech Stack**

- **Backend:** Node.js, Express
- **Database:** MySQL (Railway)
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io (optional for real-time features)
- **Deployment:** Render

---

## **Folder Structure**
backend/
├── server.js
├── db.js
├── .env
├── routes/
│ ├── auth.js
│ └── notes.js
└── middleware/
└── authMiddleware.js

---

## **Environment Variables**
Create a `.env` file (or set in Render):
PORT=1000
JWT_SECRET=supersecret123
DB_HOST=metro.proxy.rlwy.net
DB_PORT=28273
DB_USER=root
DB_PASSWORD=<your_password>
DB_NAME=railway

> ⚠️ Never commit `.env` to GitHub — it contains secrets.
---
## **Database Setup (MySQL)**

Run these queries in Railway MySQL or MySQL Workbench:


CREATE DATABASE IF NOT EXISTS railway;

USE railway;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password TEXT,
  role ENUM('admin','editor','viewer') DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  owner_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  note_id INT,
  action VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


git clone https://github.com/<your-username>/realtime-notes-backend.git
cd realtime-notes-backend/backend
npm install


npm run dev

API Endpoints
Authentication

POST /auth/register → Register a new user

POST /auth/login → Login and get JWT token

Notes (Protected by JWT)

POST /notes → Create a note

GET /notes → Get all user notes

PUT /notes/:id → Update note

DELETE /notes/:id → Delete note

GET /notes/search?q=keyword → Search notes by title/content

GET /notes/:id/share → Generate shareable read-only link

GET /notes/public/:token → Access shared note without login

All protected routes require header:
Authorization: Bearer <JWT_TOKEN>

Deployment

Backend: Render

Database: Railway MySQL (public endpoint: metro.proxy.rlwy.net:28273)
 


Author
Venkata Siva Kumar
GitHub: venkatasiva2117



