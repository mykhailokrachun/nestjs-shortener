# NestJS Shortener

This project allows users to create shortened URLs that redirect to the original URLs. API has routes to shorten URLs, redirect to the original URLs, track clicks, and retrieve statistics about the shortened URLs.

## Features

- **Shorten URLs:** shortens URLs that redirect to the original URLs.
- **Click Tracking:** tracks the number of times a shortened URL has been accessed.
- **Statistics:** retrieves click statistics for each shortened URL.
- **Swagger Documentation:** API documentation available at `/api`. For example, `http://localhost:3000/api`.
- **Rate Limiting:** limits the number of requests to 10 per minute using Redis.
- **Cache:** caches URL data using Redis for improved performance.

## Technologies Used

- **NestJS, MongoDB, Redis, Docker, Swagger**

  Docker is used to simplify setup of databases locally.

## Installation

### Prerequisites

- **Docker:** Ensure Docker is installed on your machine in case you want to use local databases.
- **Node.js:** Required if you want to run the project without Docker.

### Getting Started

Clone the repository:

```bash
git clone https://github.com/mykhailokrachun/nestjs-shortener.git
cd nestjs-shortener
```

### Option 1: Run with Docker Compose (Local Databases)

If you want to run the application with local MongoDB and Redis instances using docker compose:

1. **Create a `.env.local` file** in the root of the project based on the `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

2. **Fill the `.env.local` file**

3. **Run the application** with docker compose:

   ```bash
   docker compose up
   ```

   This will build and start the application along with MongoDB and Redis in Docker containers. The API will be available at `http://localhost:3000`.

**_Note:_** In case you want to change the .env.local file, you need to rebuild the docker image and after that run the application with docker compose:

```bash
docker compose build
```

### Option 2: Run with External Databases

If you prefer to use external MongoDB and Redis services (e.g., on Render or another cloud provider):

1. **Create a `.env` file** in the root of the project based on the `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. **Fill the `.env.local` file**

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Run the application**:

   ```bash
   npm run start
   ```

   The API will be available at `http://localhost:3000`.

### API Documentation

Once the application is running, you can access the Swagger UI for API documentation at: `http://localhost:3000/api`.
