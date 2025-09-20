# Civic Reporter

## Overview

Civic Reporter is a mobile-first Progressive Web Application (PWA) designed to enable citizens to report municipal issues such as potholes, garbage collection problems, and infrastructure concerns. The platform serves as a bridge between citizens and local government departments, facilitating efficient issue tracking and resolution. The system supports multiple user roles including citizens, ward officers, and administrators, with features for geolocation-based reporting, file uploads, and status tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite as the build tool for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens and responsive design
- **State Management**: React hooks and context for local state management
- **Routing**: React Router DOM for client-side routing in the single-page application
- **PWA Support**: Configured as a Progressive Web Application with mobile-first responsive design
- **Maps Integration**: Leaflet for interactive maps and geolocation features
- **HTTP Client**: Fetch API with custom wrapper for API communication
- **File Handling**: Browser-image-compression for client-side image optimization before upload

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Database Layer**: Knex.js as SQL query builder with support for migrations and seeding
- **Authentication**: JWT (JSON Web Tokens) for stateless authentication
- **File Storage**: Multer for handling multipart/form-data file uploads with local disk storage
- **Security**: Helmet for security headers, CORS for cross-origin requests, bcryptjs for password hashing
- **Validation**: Joi for request data validation and sanitization
- **Rate Limiting**: Express-rate-limit for API protection against abuse
- **Logging**: Winston for structured logging with file and console outputs

### Database Design
- **Current Implementation**: SQLite3 for development with Knex migrations
- **Production Ready**: PostgreSQL support configured with PostGIS extension for geospatial data
- **Schema**: Normalized relational design with users, departments, reports, and status tracking tables
- **Migrations**: Version-controlled database schema changes using Knex migration system
- **Seeding**: Sample data generation for development and testing environments

### Workspace Structure
- **Monorepo Setup**: Yarn workspaces managing frontend, backend, and ml (machine learning) packages
- **Development Workflow**: Concurrently running frontend and backend in development mode
- **Build Process**: Separate build processes for each workspace with shared dependencies

## External Dependencies

### Core Technologies
- **Database**: SQLite3 (development), PostgreSQL with PostGIS (production) for geospatial features
- **Caching**: Redis for session storage and application caching
- **File Storage**: MinIO (S3-compatible) for scalable file storage in production
- **Maps**: Mapbox GL JS integration for interactive mapping features

### Third-Party Services
- **Email**: Nodemailer for notification emails and user communications
- **AWS SDK**: Integration with Amazon Web Services for cloud storage and services
- **Image Processing**: Browser-side image compression for optimized file uploads

### Development Tools
- **Testing**: Jest for unit testing with Supertest for API endpoint testing
- **Development Server**: Nodemon for backend hot-reloading, Vite for frontend development
- **Code Quality**: Babel for JavaScript transpilation, ESM module support throughout

### Security & Monitoring
- **Rate Limiting**: Express-rate-limit for API protection
- **Security Headers**: Helmet.js for HTTP security headers
- **Input Validation**: Joi schema validation for all API inputs
- **Logging**: Winston with multiple transport layers for error tracking and debugging