# LTecDeco Backend API

Backend API for LTecDeco application built with NestJS, TypeScript, and PostgreSQL.

## Features

- **RESTful API** with TypeScript
- **PostgreSQL** database with TypeORM
- **Environment-based** configuration
- **API Documentation** with Swagger
- **Health Checks** endpoint
- **Rate Limiting** for API protection
- **Volume-based Pricing** - Dynamic pricing based on product quantity
- **Product Management** - Templates, variations, and categories
- **Shopping Cart** with dynamic pricing

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

## Volume-based Pricing

The API supports dynamic pricing based on product quantity through price tiers:

### Features

- **Multiple Price Tiers** per product variation
- **Quantity-based Discounts** - Different prices for different quantity ranges
- **Automatic Price Calculation** in shopping cart
- **Admin Management** via REST API

### API Endpoints

#### Get Price for Quantity

```http
GET /product-price-tiers/price/{variationId}?quantity={number}
```

#### Manage Price Tiers

```http
GET    /product-price-tiers              # List all tiers
GET    /product-price-tiers/{id}         # Get specific tier
GET    /product-price-tiers/by-variation/{variationId}  # Get tiers for variation
POST   /product-price-tiers              # Create new tier
PATCH  /product-price-tiers/{id}         # Update tier
DELETE /product-price-tiers/{id}         # Delete tier
```

### Example Usage

**Create a price tier:**

```json
POST /product-price-tiers
{
  "variation_id": "uuid-here",
  "min_quantity": 10,
  "max_quantity": 49,
  "price": 90.00,
  "is_active": true,
  "sort_order": 1
}
```

**Get price for 25 units:**

```http
GET /product-price-tiers/price/uuid-here?quantity=25
# Returns: {"price": 90.00, "quantity": 25}
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
