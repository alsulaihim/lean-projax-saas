# Quick Start Guide

Get the BPI Assignment Platform running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check if PostgreSQL is available
docker --version  # If using Docker
# OR
psql --version   # If using local PostgreSQL
```

## Setup Steps

### 1. Database Setup (Choose One)

#### Option A: Docker (Recommended for Development)

```bash
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  --name bpi-postgres \
  postgres:15
```

#### Option B: Local PostgreSQL

Make sure PostgreSQL is running and create a database:

```bash
createdb bpi_platform_dev
```

### 2. Install & Configure

```bash
# Install dependencies
npm install

# Environment is already set up in .env.local
# (DATABASE_URL is configured for Docker PostgreSQL)
```

### 3. Initialize Database

```bash
# Push schema and seed data
npm run db:push && npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the Platform

Open [http://localhost:3070](http://localhost:3070)

**Login with test account:**

- Email: `analyst@example.com`
- Password: `password123`

## What You'll See

1. **Login Page** - Black and white minimalist design
2. **Assignment Dashboard** - View test assignments
3. **Protected Routes** - Role-based access control in action

## Next Steps

- Explore the assignment dashboard
- Check different user roles (see README.md for credentials)
- Review the seeded data in Prisma Studio: `npm run db:studio`

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps  # Should show bpi-postgres container

# If not, start it
docker start bpi-postgres
```

### Port 3020 Already in Use

```bash
# Kill the process using port 3020
lsof -ti:3020 | xargs kill

# Or use a different port
PORT=3021 npm run dev
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npm run db:generate
```

## Development Workflow

1. **Make changes** to code
2. **Auto-reload** happens automatically (Turbopack)
3. **Check database** with Prisma Studio: `npm run db:studio`
4. **Reset database** if needed: `npm run db:push && npm run db:seed`

## Useful Commands

```bash
# View logs
npm run dev         # Ctrl+C to stop

# Database management
npm run db:studio   # Visual database browser
npm run db:seed     # Reset with test data

# Code quality
npm run lint        # Check for issues
```

## Ready to Build?

Check out the [README.md](./README.md) for full documentation and the implementation roadmap.
