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
- POST /createItinerary → Create itinerary
- GET /getTripList → Get user-specific itineraries
- POST /updateItinerary → Update itinerary
- POST /deleteTrip → Delete itinerary