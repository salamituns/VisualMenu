# Restaurant Menu Visualizer - Development Instructions

## Project Overview

The Restaurant Menu Visualizer is a SaaS platform designed to transform traditional text-based restaurant menus into interactive digital experiences. The platform utilizes OCR technology to extract menu text and enables restaurants to enhance their menus with visual content and additional information.

### Core Vision
- Transform text menus into visual, interactive digital experiences
- Simplify menu management for restaurants
- Enhance customer ordering experience through visual presentation
- Provide analytics and insights to restaurant owners

## System Architecture

### Technology Stack
- Frontend: React + TypeScript with Vite
- Styling: Tailwind CSS + shadcn/ui components
- Backend: Supabase
- OCR: Azure Computer Vision API
- Storage: Supabase Storage
- Caching: Redis
- CDN: For image delivery

### Core Components

1. **Client Layer**
   - Restaurant Admin Dashboard (React web application)
   - Customer Mobile View (Progressive Web App)

2. **API Gateway Layer**
   - Admin API Gateway (protected routes)
   - Public API Gateway (customer-facing)

3. **Core Services Layer**
   - Menu Management Service
   - Image Processing Service
   - OCR Processing Service
   - Analytics Service
   - QR Generator Service

4. **Data Layer**
   - PostgreSQL Database (via Supabase)
   - Redis Cache
   - CDN for static assets

## Project Structure

```
restaurant-visualizer/
├── src/
│   ├── components/
│   │   ├── common/           # Shared components
│   │   ├── admin/            # Admin dashboard components
│   │   ├── customer/         # Customer view components
│   │   └── ui/              # shadcn/ui components
│   ├── services/
│   │   ├── api/             # API services
│   │   ├── ocr/             # OCR processing
│   │   ├── images/          # Image handling
│   │   └── analytics/       # Analytics services
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles
│   └── pages/               # Route pages
├── public/                  # Static assets
└── tests/                   # Test files
```

## Core Functionality

### 1. Authentication System
- User registration and login
- Role-based access control
- Session management
- Protected routes

### 2. Menu Management
- OCR text extraction
- Menu item CRUD operations
- Category management
- Image upload and processing
- Version control
- Bulk operations

### 3. Image Processing
- Automatic optimization
- Format conversion
- Thumbnail generation
- CDN distribution
- Gallery management

### 4. QR Code System
- Dynamic QR generation
- Table/location association
- Usage tracking
- Print integration

### 5. Analytics
- Usage metrics collection
- Customer behavior analysis
- Performance monitoring
- Report generation
- Data visualization

## Database Schema

```sql
-- Core Tables
restaurants (
    id UUID PRIMARY KEY,
    name TEXT,
    profile JSON,
    settings JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

menu_items (
    id UUID PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id),
    category_id UUID REFERENCES categories(id),
    name TEXT,
    description TEXT,
    price DECIMAL,
    images JSON[],
    attributes JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

categories (
    id UUID PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id),
    name TEXT,
    description TEXT,
    order_index INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

qr_codes (
    id UUID PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id),
    location TEXT,
    usage_count INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## Implementation Phases

### Phase 1: Foundation (2-4 Weeks)
1. **Database Setup**
   - Complete schema implementation
   - Migration setup
   - Backup procedures

2. **Core Authentication**
   - User management
   - Role-based access
   - Session handling

3. **Basic Menu Management**
   - CRUD operations
   - Category system
   - Basic image handling

### Phase 2: Essential Features (4-6 Weeks)
1. **OCR Integration**
   - Azure Computer Vision setup
   - Text extraction
   - Error handling
   - Manual verification

2. **Enhanced Menu Management**
   - Bulk operations
   - Version control
   - Advanced image handling
   - Search functionality

3. **Customer Interface**
   - Mobile-responsive viewer
   - PWA setup
   - Offline capabilities
   - Performance optimization

### Phase 3: Advanced Features (6-8 Weeks)
1. **Analytics System**
   - Data collection
   - Visualization components
   - Report generation
   - Performance monitoring

2. **Integration Features**
   - API gateway implementation
   - Third-party integrations
   - Custom feature development

3. **Security & Optimization**
   - Advanced caching
   - CDN setup
   - Security hardening
   - Performance tuning

## Development Guidelines

### Code Standards
- Use TypeScript strict mode
- Follow ESLint configuration
- Maintain consistent code formatting
- Write comprehensive tests
- Document all functions and components

### Performance Requirements
- Page load time < 2 seconds
- API response time < 200ms
- Image load time < 1 second
- Support 10,000+ concurrent users

### Security Requirements
- Implement JWT authentication
- Use role-based access control
- Enable data encryption
- Implement API rate limiting
- Enforce HTTPS
- Follow OWASP guidelines

### Testing Strategy
1. **Unit Tests**
   - Component testing
   - Service testing
   - Utility function testing

2. **Integration Tests**
   - API endpoint testing
   - Service integration testing
   - Database operation testing

3. **End-to-End Tests**
   - User flow testing
   - Critical path testing
   - Performance testing

## Documentation Requirements

### Technical Documentation
- API documentation
- Component documentation
- Database schema
- Integration guides
- Deployment procedures

### User Documentation
- Admin user guide
- Customer guide
- Training materials
- Troubleshooting guide

## Development Tools

### Required Tools
- Node.js and npm/yarn
- Git for version control
- VS Code (recommended)
- Supabase CLI
- Docker for local development

### VS Code Extensions
- ESLint
- Prettier
- TypeScript and TSLint
- Tailwind CSS IntelliSense
- GitLens

## Getting Started

1. **Environment Setup**
   ```bash
   git clone [repository-url]
   cd restaurant-visualizer
   npm install
   cp .env.example .env
   ```

2. **Database Setup**
   ```bash
   supabase init
   supabase start
   ```

3. **Running the Application**
   ```bash
   npm run dev
   ```

4. **Running Tests**
   ```bash
   npm run test
   ```

## Deployment

### Development Environment
- Vercel for frontend
- Supabase for backend
- GitHub Actions for CI/CD

### Production Environment
- Custom domain setup
- SSL certification
- Database backup configuration
- Monitoring setup

## Support and Resources

### Documentation
- Project documentation in `/docs`
- API documentation via Swagger
- Component documentation via Storybook

### Support Channels
- GitHub Issues for bug tracking
- Slack for team communication
- Email support for critical issues
