# Visual Menu

A modern, visual menu management system built with Next.js and Supabase.

## Deployment Instructions

### Prerequisites
- Node.js 18+ installed
- A Supabase account
- A Vercel account (recommended for deployment)

### Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Production Deployment

#### Option 1: Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

Vercel will automatically build and deploy your application.

#### Option 2: Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Database Setup

1. Set up a new project in Supabase
2. Run the database migrations (found in `supabase/migrations`)
3. Update your environment variables with the new database credentials

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flows
- [ ] Verify image uploads are working
- [ ] Check database connections
- [ ] Test menu item CRUD operations
- [ ] Verify customer-facing menu view

## Features

- Visual menu management
- Real-time updates
- Image upload and management
- Category organization
- Dietary preference filtering
- Responsive design
- Dark/light mode support

## Tech Stack

- Next.js 14
- React
- TypeScript
- Supabase
- Tailwind CSS
- shadcn/ui
- React Query
