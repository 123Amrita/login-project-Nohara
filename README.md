# TrailMate - Backend (Node.js + Express + MongoDB)

This is the backend service for the TrailMate Travel Planner application. It provides REST APIs for authentication and itinerary management.

## 🚀 Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

## 🔐 Features
- User Signup & Login
- JWT-based Authentication
- Protected Routes
- Create, Read, Update, Delete (CRUD) Itineraries
- User-specific data handling

## 📁 API Endpoints

### Auth Routes
- POST /signup → Register new user
- POST /login → Login user

### Itinerary Routes (Protected)
- POST /itinerary → Create itinerary
- GET /itinerary → Get user-specific itineraries
- PUT /itinerary/:id → Update itinerary
- DELETE /itinerary/:id → Delete itinerary

## ⚙️ Installation

```bash
git clone https://github.com/123Amrita/login-project-Nohara
cd backend
npm install