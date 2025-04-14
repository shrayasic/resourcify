# Project Title

## Description
This project is a web application that allows users to manage topics, subtopics, and resources. It features user authentication, file uploads, and a user-friendly interface built with React. The backend is powered by Flask, providing a robust API for data management.

## Features
- User registration and login with JWT authentication.
- Create, read, update, and delete topics and subtopics.
- Upload and manage resources associated with subtopics.
- Search functionality for topics and subtopics.
- Responsive design for a seamless user experience.

## Technologies Used
- **Backend**: Flask, Flask-CORS, Flask-PyMongo, Flask-Bcrypt, Flask-JWT-Extended, MongoDB
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Cloud Storage**: Cloudinary for file uploads
- **Environment Variables**: dotenv for managing configuration

## Installation Instructions

### Backend
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```
2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required packages:
   ```bash
   npm install
   ```

## Usage
1. Start the backend server:
   ```bash
   python app.py
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```

## API Endpoints
- **User Authentication**
  - `POST /api/register`: Register a new user.
  - `POST /api/login`: Log in an existing user.

- **Topics**
  - `GET /api/topics`: Get all topics for the logged-in user.
  - `POST /api/topics`: Create a new topic.
  - `GET /api/topics/search`: Search for topics by name.

- **Subtopics**
  - `GET /api/topics/<topic_id>/subtopics`: Get all subtopics for a specific topic.
  - `POST /api/topics/<topic_id>/subtopics`: Create a new subtopic.

- **Resources**
  - `GET /api/subtopics/<subtopic_id>/resources`: Get all resources for a specific subtopic.
  - `POST /api/subtopics/<subtopic_id>/resources`: Create a new resource.

## Frontend Scripts
- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint to check for code quality.
- `npm run preview`: Preview the built application.

