# Resourcify: Resource Management System

## Description
The Topic Management System is a web application designed to help users manage topics, subtopics, and associated resources. It provides a user-friendly interface for creating, updating, and deleting topics and subtopics, as well as uploading and managing resources. The application features user authentication, allowing users to securely log in and manage their content.

## Features
- **User Authentication**: Secure registration and login using JWT tokens.
- **Topic Management**: Create, read, update, and delete topics.
- **Subtopic Management**: Create, read, update, and delete subtopics under each topic.
- **Resource Management**: Upload and manage resources associated with subtopics.
- **Search Functionality**: Search for topics and subtopics by name.
- **File Uploads**: Upload files to Cloudinary for resource management.
- **Responsive Design**: A modern and responsive user interface built with React and Tailwind CSS.

## Technologies Used
- **Backend**:
  - Flask: A lightweight WSGI web application framework.
  - Flask-CORS: For handling Cross-Origin Resource Sharing.
  - Flask-PyMongo: For MongoDB integration.
  - Flask-Bcrypt: For password hashing.
  - Flask-JWT-Extended: For JWT authentication.
  - MongoDB: NoSQL database for data storage.
  - Cloudinary: For file uploads and management.
  - dotenv: For managing environment variables.

- **Frontend**:
  - React: A JavaScript library for building user interfaces.
  - Vite: A build tool that provides a fast development environment.
  - Tailwind CSS: A utility-first CSS framework for styling.
  - Axios: For making HTTP requests to the backend API.

