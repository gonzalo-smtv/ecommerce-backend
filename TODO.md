# LTecDeco Backend - TODO List

This document outlines planned enhancements and features for the LTecDeco backend application.

## Completed Features

- [x] Basic Swagger documentation setup
- [x] Basic Products CRUD operations
- [x] File storage with Supabase integration
- [x] API documentation with Swagger
- [x] Database migrations with TypeORM
- [x] Rate limiting protection
- [x] Health check endpoint
- [x] Docker setup for development
- [x] Support multiple images per product and zoom feature
- [x] Cart full implementation
- [x] Proxy images
- [x] Add user roles (owner, admin, customer)
- [x] Support for OAuth providers (Google, Facebook)

## Next Steps

- [ ] Implement MercadoPago 👷🏻‍♂️ S
      . When preference is created, the order should be created and the payment should be created with it and status should be pending.
      . If user goes to the checkout page, try to get the order and payment by the external reference. If not found, create a new one.
- [ ] Improve database schema 👷🏻‍♂️ S
- [ ] Implement certificate authentication between the backend and the frontend. Header signature with the certificate.

## Authentication & Authorization

- [ ] Protect relevant routes with guards
- [ ] Implement JWT-based authentication

## Orders Module

- [ ] Create Order entity with relationships to products
- [ ] Implement checkout process
- [ ] Add order history and status tracking

## Categories System

- [ ] Create a proper Category entity instead of just a string field on products
- [ ] Implement hierarchical categories with parent-child relationships
- [ ] Add category filtering endpoints

## Product Reviews & Ratings

- [x] Basic rating and reviewCount fields on product entity
- [ ] Create a dedicated Review entity linked to products and users
- [ ] Add endpoints for submitting and fetching reviews
- [ ] Calculate average ratings automatically

## Search & Filtering

- [x] Basic product retrieval
- [ ] Implement advanced search functionality for products
- [ ] Add filtering by multiple criteria
- [ ] Add pagination and sorting options

## Cart System

- [x] Create Cart entity to store temporary orders
- [x] Add endpoints for cart management

## Inventory Management

- [x] Basic stock status field on product entity
- [ ] Track product stock levels with dedicated inventory system
- [ ] Add automatic inventory updates on order placement

## Payment Integration

- [ ] Integrate with payment gateways like Stripe or PayPal
- [ ] Implement payment status tracking

## Enhanced Validation & DTOs

- [ ] Create proper DTOs for all endpoints
- [ ] Implement comprehensive validation

## Testing Implementation Plan

### Test Environment Setup

- [ ] Set up test environment configuration and database setup
- [ ] Configure test database with proper isolation
- [ ] Set up test environment variables and configurations

### Test Infrastructure & Utilities

- [ ] Create test utilities and helpers (mocks, factories, setup)
- [ ] Set up entity factories for test data generation
- [ ] Create mock services for external dependencies (Supabase, Cache)
- [ ] Configure test database seeding and cleanup

### Unit Tests by Module

#### Core Entities & Models

- [ ] Implement unit tests for core entities and models
- [ ] Test entity relationships and validations
- [ ] Test TypeORM decorators and configurations

#### Products Module

- [ ] Create unit tests for ProductsService
  - [ ] Test CRUD operations (create, read, update, delete)
  - [ ] Test category filtering and search methods
  - [ ] Test attribute filtering functionality
  - [ ] Test image handling logic
  - [ ] Test error handling and edge cases
- [ ] Create unit tests for ProductsController
  - [ ] Test all HTTP endpoints
  - [ ] Test request validation and DTOs
  - [ ] Test file upload handling
  - [ ] Test error responses and status codes

#### Users Module

- [ ] Create unit tests for UsersService
  - [ ] Test user creation and authentication
  - [ ] Test user profile management
  - [ ] Test password handling and validation
- [ ] Create unit tests for UsersController
  - [ ] Test user registration endpoints
  - [ ] Test profile management endpoints
  - [ ] Test authentication flows

#### Categories Module

- [ ] Create unit tests for CategoriesService
  - [ ] Test category CRUD operations
  - [ ] Test hierarchical category relationships
  - [ ] Test slug generation and uniqueness
- [ ] Create unit tests for CategoriesController
  - [ ] Test category management endpoints
  - [ ] Test category retrieval and filtering

#### Cart Module

- [ ] Create unit tests for CartService
  - [ ] Test cart creation and management
  - [ ] Test item addition and removal
  - [ ] Test cart persistence and session handling
- [ ] Create unit tests for CartController
  - [ ] Test cart API endpoints
  - [ ] Test session-based cart operations

#### Payments Module

- [ ] Create unit tests for PaymentsService
  - [ ] Test payment processing logic
  - [ ] Test order creation and management
  - [ ] Test webhook handling
  - [ ] Test MercadoPago integration (mocked)
- [ ] Create unit tests for PaymentsController
  - [ ] Test checkout endpoints
  - [ ] Test payment status endpoints
  - [ ] Test webhook validation

#### Attributes Module

- [ ] Create unit tests for AttributesService
  - [ ] Test attribute CRUD operations
  - [ ] Test attribute-value relationships
  - [ ] Test product-attribute assignments
- [ ] Create unit tests for AttributesController
  - [ ] Test attribute management endpoints

#### Storage Module

- [ ] Create unit tests for StorageService
  - [ ] Test file upload functionality
  - [ ] Test file deletion and management
  - [ ] Test Supabase integration (mocked)
  - [ ] Test error handling for storage operations

#### Cache Module

- [ ] Create unit tests for CacheService
  - [ ] Test caching mechanisms
  - [ ] Test cache invalidation
  - [ ] Test cache hit/miss scenarios

### Integration Tests

- [ ] Set up integration tests for API endpoints
- [ ] Test module interactions and dependencies
- [ ] Test database operations with real TypeORM
- [ ] Test authentication and authorization flows

### End-to-End Tests

- [ ] Create end-to-end tests for critical user flows
- [ ] Test complete product lifecycle (create → update → delete)
- [ ] Test cart to checkout flow
- [ ] Test user registration and authentication flow
- [ ] Test payment processing flow (with mocked external services)

### Testing Quality & Maintenance

- [ ] Configure test coverage reporting and quality gates
- [ ] Set up test coverage thresholds (aim for 80%+ coverage)
- [ ] Configure test linting and formatting
- [ ] Set up test scripts and CI/CD integration
- [ ] Add pre-commit hooks for test validation

## Logging & Monitoring

- [ ] Implement structured logging
- [ ] Add performance monitoring

## Cache Implementation

- [ ] Add Redis caching for frequently accessed data
- [ ] Cache product listings and other high-volume endpoints

## Improved Documentation

- [ ] Enhance Swagger documentation with more details
- [ ] Add example requests and responses

## Webhooks & Notifications

- [ ] Implement webhooks for third-party integrations
- [ ] Add notification system (email, push) for order updates

## User Management Module

- [ ] Create User entity with registration and profile management
- [ ] Implement password reset functionality
- [ ] Add email verification
