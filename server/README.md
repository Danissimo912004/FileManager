# File Manager Backend

This is the backend server for the File Manager application. It provides a REST API for managing files and folders, with authentication and admin features.

## Features

- REST API with Express and TypeScript
- SQLite database with Sequelize ORM
- JWT-based authentication
- File upload handling
- Admin panel API
- Swagger documentation
- CORS and security features

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Build the project:
```bash
npm run build
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Documentation

Swagger documentation is available at http://localhost:3000/api-docs

## API Endpoints

### Authentication
- POST /api/auth/login - Login user
- POST /api/auth/register - Register new user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user info

### Files
- GET /api/files - Get list of files and folders
- POST /api/files/folder - Create new folder
- POST /api/files/upload - Upload file
- DELETE /api/files/:id - Delete file or folder
- GET /api/files/:id/download - Download file

### Admin
- GET /api/admin/files - Get all files (admin only)
- GET /api/admin/users - Get all users (admin only)
- DELETE /api/admin/users/:id - Delete user (admin only)

## Environment Variables

- PORT - Server port (default: 3000)
- NODE_ENV - Environment (development/production)
- JWT_SECRET - Secret key for JWT tokens
- CLIENT_URL - Frontend application URL for CORS

## Database

The application uses SQLite as the database. The database file will be created automatically at `database.sqlite` when you start the server.

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- File upload validation
- CORS configuration
- Protected admin routes
- Cookie security (HttpOnly, Secure flags)

## Error Handling

The API uses standard HTTP status codes and returns error messages in JSON format:

```json
{
  "message": "Error message here"
}
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request 