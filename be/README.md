# Backend Task API

A robust REST API built with Node.js, Express.js, and MongoDB. This project provides a complete backend boilerplate with user authentication (JWT) and basic data handling.

## Features

- **User Authentication**: Secure registration and login using JSON Web Tokens (JWT).
- **Password Hashing**: Passwords are encrypted using `bcryptjs` before being saved to the database.
- **Protected Routes**: Middleware to verify JWT and protect specific endpoints from unauthorized access.
- **MongoDB Integration**: Object Data Modeling (ODM) using `mongoose`.
- **Global Error Handling**: Centralized error middleware to return consistent API responses.
- **CORS Enabled**: Cross-Origin Resource Sharing is enabled out of the box.

## Tech Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database.
- **Mongoose**: MongoDB object modeling.
- **JWT**: JSON Web Tokens for authentication.
- **Bcrypt.js**: Library for hashing passwords.

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- A MongoDB cluster (e.g., [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1. Clone the repository or download the project files.
2. Open a terminal and navigate to the project directory:
   ```bash
   cd backendtask
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory of the project and add the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

> **Note**: Make sure to replace `your_mongodb_connection_string` with your actual MongoDB URI and add your current IP address to the Network Access whitelist in MongoDB Atlas.

### Running the Server

Start the development server:
```bash
npm run dev
```

Or start in production mode:
```bash
npm start
```

The server should be running on `http://localhost:5000`.

## API Endpoints

> **Tip**: You can import the `postman_collection.json` file included in the repository into Postman to easily test all the endpoints below!

### Authentication

- **POST `/api/auth/register`**
  - **Description**: Register a new user.
  - **Body (JSON)**: `username`, `email`, `password`

- **POST `/api/auth/login`**
  - **Description**: Authenticate a user and get a JWT.
  - **Body (JSON)**: `email`, `password`

### Data (Protected Routes)

*(Requires an `Authorization` header with `Bearer <token>`)*

- **GET `/api/data`**
  - **Description**: Get all data.

- **POST `/api/data`**
  - **Description**: Create new data.

## Project Structure

```text
backendtask/
├── config/             # Database connection setup
├── controllers/        # Route controllers (logic for endpoints)
├── middleware/         # Custom Express middlewares (Auth, Error handling)
├── models/             # Mongoose schemas/models
├── routes/             # API route definitions
├── .env.example        # Example environment variables template
├── .env                # Environment variables (not tracked in Git)
├── postman_collection.json # API collection for Postman
├── package.json        # Project metadata and dependencies
└── server.js           # Entry point of the application
```
