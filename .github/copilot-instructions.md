# Ecommerce Backend - AI Assistant Instructions

## Project Overview

Ecommerce is an e-commerce backend API built with NestJS, TypeScript, and PostgreSQL. The application follows a modular architecture with clean separation of concerns.

## Architecture

- **NestJS Modules**: The codebase is organized into feature modules (`cart`, `products`, `payments`, etc.)
- **REST API Design**: Controllers handle HTTP requests, Services contain business logic
- **Database Access**: TypeORM entities in each module's `entities/` folder
- **DTOs**: Data Transfer Objects in `dto/` folders define request/response shapes
- **Middleware**: Custom middleware in module-specific `middleware/` folders
- **TypeORM**: Used for database access with migrations in `src/database/migrations/`

## Key Workflows

### Package Management

- This project exclusively uses **npm** as the package manager
- **nvm** is used for Node.js version management
- Do not use yarn, pnpm, or other package managers

### Development

```bash
# Start development server with hot reload
npm run start:dev

# Build for production
npm run build
npm run start:prod

# Database migrations
npm run migration:generate -- -n YourMigrationName
npm run migration:run
```

### Docker Development

```bash
# Start PostgreSQL container
docker-compose up -d postgres
```

## Project Conventions

### Language

All code, including comments and documentation, must be written in English, even if communication with the developer is in Spanish.

### Path Aliases

The project uses the `@app` path alias for imports from the `src` directory:

```typescript
import { ProductsService } from '@app/products/products.service';
```

### Custom Decorators

Custom decorators are used for common patterns:

```typescript
// Cart information extraction example
@CartInfo() cartInfo: CartInfoType
```

### Error Handling

Services throw specific NestJS exceptions:

```typescript
throw new NotFoundException(`Product with ID ${productId} not found`);
throw new BadRequestException(`Product ${product.name} is out of stock`);
```

## Core Features

### Cart System

- Supports both authenticated and anonymous users (via cookies)
- Custom `CartSessionMiddleware` manages anonymous cart sessions
- `CartInfo` decorator extracts cart data from request

### Storage/File Management

- Uses Supabase for file storage
- Environment variables configure storage settings (see `environments.ts`)

### API Documentation

- Swagger UI available at `/api/docs` with OpenAPI spec at `/api/docs-json`
- All endpoints should use Swagger decorators for documentation

### Rate Limiting

- Built-in rate limiting via `ThrottlerModule`
- Configured in `app.module.ts` with environment variables

## Ongoing Development

- See `TODO.md` for planned features and enhancements
- Current focus is on payment integration with MercadoPago and cart implementation
