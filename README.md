# LTecDeco Backend API

Backend API for LTecDeco application built with NestJS, TypeScript, and PostgreSQL.

## Features

- **RESTful API** with TypeScript
- **PostgreSQL** database with TypeORM
- **Environment-based** configuration
- **API Documentation** with Swagger
- **Health Checks** endpoint
- **Rate Limiting** for API protection

## Prerequisites

- Node.js (v22 or later)
- npm
- PostgreSQL (v12 or later)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Configure your database connection in `.env`

## Running the App

```bash
# Development
$ npm run start:dev

# Production
$ npm run build
$ npm run start:prod
```

## API Documentation

After starting the application, the API documentation will be available at:

- Swagger UI: http://localhost:3000/api/docs
- JSON format: http://localhost:3000/api/docs-json

## Rate Limiting

The API is protected with rate limiting:

- 10 requests per minute per IP address
- Custom error message on rate limit exceeded

## Health Check

Check the API health status:

```
GET /api/health
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DB_HOST` - Database host
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `PORT` - Application port (default: 3000)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
