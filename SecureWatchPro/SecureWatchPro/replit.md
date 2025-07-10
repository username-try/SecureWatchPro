# SecureWatch Pro - Surveillance System

## Overview

SecureWatch Pro is a professional surveillance system built with a modern full-stack architecture. It enables real-time camera monitoring, motion detection, and secure device-to-device communication through unique access codes. The system supports two device roles: Monitor (for viewing cameras) and Camera (for streaming video).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- Fixed all navigation imports to use wouter's useLocation hook (January 2025)
- Resolved WebSocket navigation issues across all pages
- Application is fully functional with monitor creation working properly
- Vite HMR warning is development-only and doesn't affect core functionality

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **WebSocket**: Built-in WebSocket server for real-time communication
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless database

### Key Components

#### Authentication System
- **Access Code Based**: Uses 20-character alphanumeric codes for secure device pairing
- **No Traditional Auth**: Simplified security model focused on device-to-device access
- **Code Generation**: Random collision-resistant access codes

#### Real-time Communication
- **WebSocket Server**: Handles live video streaming and motion detection events
- **Connection Types**: Separate handling for monitor and camera device connections
- **Room-based Communication**: Devices join specific rooms for targeted messaging

#### Database Schema
- **Monitors Table**: Stores monitor devices with unique access codes
- **Cameras Table**: Camera devices linked to monitors with configurable settings
- **Motion Events Table**: Logs motion detection events with bounding box data

#### Surveillance Features
- **Motion Detection**: Real-time motion detection with configurable sensitivity
- **Night Vision**: Infrared capability toggle
- **Region of Interest (ROI)**: Configurable detection zones
- **Video Settings**: Adjustable resolution and frame rate

## Data Flow

1. **Device Setup**: Users create monitors or cameras with unique access codes
2. **Device Pairing**: Cameras connect to monitors using access codes
3. **Real-time Streaming**: WebSocket connections handle live video feeds
4. **Motion Detection**: Server processes motion events and notifies connected monitors
5. **Settings Management**: Camera configurations stored in database and synchronized via WebSocket

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-kit for database management
- **UI Components**: @radix-ui component library with shadcn/ui
- **WebSocket**: Built-in ws library for real-time communication
- **Validation**: zod for schema validation with drizzle-zod integration

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Development server with HMR and optimized builds
- **ESBuild**: Fast backend bundling for production
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Drizzle push for schema synchronization

### Production
- **Frontend**: Static build served from Express
- **Backend**: Bundled with ESBuild for optimal performance
- **Database**: PostgreSQL with connection pooling via Neon
- **WebSocket**: Integrated with HTTP server for unified deployment

### Environment Configuration
- **Database URL**: Required environment variable for database connection
- **CORS**: Enabled for cross-origin WebSocket connections
- **Session Management**: Uses connect-pg-simple for PostgreSQL session storage

The architecture prioritizes real-time performance, security through access codes, and scalability through serverless database integration. The system is designed for easy deployment while maintaining professional-grade surveillance capabilities.