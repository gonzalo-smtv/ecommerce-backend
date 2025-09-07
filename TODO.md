# LTecDeco Backend - TODO List

This document outlines planned enhancements and features for the LTecDeco backend application.

## Completed Features

- [x] Basic Products CRUD operations
- [x] File storage with Supabase integration
- [x] API documentation with Swagger
- [x] Database migrations with TypeORM
- [x] Rate limiting protection
- [x] Health check endpoint
- [x] Docker setup for development

## Authentication & Authorization

- [ ] Implement JWT-based authentication
- [x] Add user roles (owner, admin, customer)
- [ ] Protect relevant routes with guards

## User Management Module

- [ ] Create User entity with registration and profile management
- [x] Support for OAuth providers (Google, Facebook)
- [ ] Implement password reset functionality
- [ ] Add email verification

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

## Testing Coverage

- [ ] Add unit tests for services
- [ ] Add e2e tests for endpoints

## Logging & Monitoring

- [ ] Implement structured logging
- [ ] Add performance monitoring

## Cache Implementation

- [ ] Add Redis caching for frequently accessed data
- [ ] Cache product listings and other high-volume endpoints

## Improved Documentation

- [x] Basic Swagger documentation setup
- [ ] Enhance Swagger documentation with more details
- [ ] Add example requests and responses

## Webhooks & Notifications

- [ ] Implement webhooks for third-party integrations
- [ ] Add notification system (email, push) for order updates
