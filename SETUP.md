# Jawla Tours Admin Dashboard - Setup & Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (http://localhost:3001 by default)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Quick Start

### 1. Install Dependencies

```bash
cd Dashboard
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the Dashboard directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your API URL:

```env
NEXT_PUBLIC_API_URL=https://back-jawla.tajera.net/api/v1/
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. First Login

Use your admin credentials to login:
- Email: admin@jawlatours.com
- Password: (as configured on your backend)

Or create a new admin account via registration.

## Build for Production

### Create Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000)

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the `Dashboard` directory
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your production API URL
5. Deploy

### Option 2: AWS

1. Build the application locally
2. Create an S3 bucket for static files
3. Use CloudFront for distribution
4. Configure custom domain

### Option 3: Docker

Create a `Dockerfile` in the Dashboard directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t jawla-admin .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=<your-api-url> jawla-admin
```

### Option 4: Traditional Server (Node.js)

1. Install Node.js on your server
2. Clone the repository
3. Install dependencies
4. Build the application
5. Use PM2 or similar for process management:

```bash
npm install -g pm2
pm2 start "npm start" --name "jawla-admin"
pm2 save
pm2 startup
```

## Configuration

### API Configuration

The admin dashboard communicates with the Jawla Tours API. Ensure your backend is properly configured:

**Required API Endpoints:**
- `/api/v1/auth/login`
- `/api/v1/auth/register`
- `/api/v1/users` (CRUD operations)
- `/api/v1/packages` (CRUD operations)
- `/api/v1/blogs` (CRUD operations)
- `/api/v1/package-bookings` (Read and status updates)

**Authentication:**
- JWT Bearer tokens
- Default expiration: 24 hours
- Stored in browser localStorage

### CORS Configuration

Your backend must allow requests from the dashboard domain:

```javascript
// Backend CORS configuration example
app.use(cors({
  origin: process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Features Overview

### Dashboard Analytics
- Real-time statistics for users, packages, blogs, and bookings
- Quick action buttons for common tasks
- Recent activity overview

### User Management
- Create, read, update, delete admin and user accounts
- Search functionality
- Role-based access control
- Password management

### Package Management
- Full CRUD operations for travel packages
- Image management
- Service list management
- Featured package toggling
- Price and currency support

### Blog Management
- HTML content editor for rich text
- SEO optimization (meta tags, keywords)
- Tag management
- Draft and publish functionality
- Image support

### Booking Management
- View all package bookings
- Update booking status (Pending, Confirmed, Cancelled, Completed)
- View passenger details and special requests
- Booking statistics dashboard

## Performance Optimization

### built-in Optimizations

The dashboard includes several built-in performance features:

1. **Code Splitting**: Automatic with Next.js
2. **Image Optimization**: Proper image handling with placeholders
3. **API Caching**: Zustand for efficient state management
4. **Lazy Loading**: Components load on demand

### Recommended Settings

For optimal performance:

1. Enable gzip compression on your server
2. Use a CDN for static assets
3. Set appropriate caching headers
4. Monitor API response times

## Security Best Practices

### 1. Environment Variables

Never commit sensitive information:
- Keep `.env.local` in `.gitignore`
- Use different keys for development and production

### 2. API Security

- Use HTTPS in production
- Enable CORS properly
- Implement rate limiting on backend
- Validate all API inputs

### 3. Authentication

- Change default passwords immediately
- Use strong password requirements
- Consider implementing 2FA on backend
- Regularly rotate API tokens

### 4. Data Protection

- Always use HTTPS for data transmission
- Implement proper error handling (don't expose sensitive data)
- Sanitize user inputs
- Use parameter validation

## Troubleshooting

### Common Issues

#### Issue: "Connection refused" when accessing API

**Solution:**
- Ensure backend API is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify firewall settings
- Check CORS configuration

#### Issue: Login page shows but can't login

**Solution:**
- Check API endpoint: `http://<api-url>/api/v1/auth/login`
- Verify credentials are correct
- Check browser console for error messages
- Clear localStorage and cookies

#### Issue: Dashboard loads but pages are blank

**Solution:**
- Check if API is responding
- Verify authentication token is valid
- Check API data format matches expected types
- Look at browser console for errors

#### Issue: Images not showing

**Solution:**
- Verify image URLs are accessible
- Check CORS headers allow image requests
- Ensure image format is supported
- Use placeholder service as fallback

### Debug Mode

Enable debug logging:

1. Open browser DevTools (F12)
2. Go to Console tab
3. API requests are logged with details
4. Check Network tab for API responses

## Monitoring

### Health Checks

The dashboard includes basic health checks:

1. API connectivity check on login
2. Token validation on each request
3. Automatic error recovery

### Logging

For production monitoring:

1. Use browser DevTools console
2. Integrate with services like:
   - Sentry (error tracking)
   - LogRocket (session monitoring)
   - New Relic (performance monitoring)

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Monitor error logs
   - Check API performance
   - Verify all features working

2. **Monthly:**
   - Update dependencies: `npm update`
   - Security audit
   - Performance review

3. **Quarterly:**
   - Full security audit
   - Database optimization
   - Feature assessment

### Updates

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update Next.js and dependencies
npm install next@latest react@latest react-dom@latest
```

## Support & Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### API Documentation

See `docs-api.json` for complete API reference

### Getting Help

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check API response in Network tab
4. Consult the README.md file

## Performance Metrics

Target metrics for optimal performance:

- Page Load: < 2 seconds
- API Response: < 500ms
- First Contentful Paint: < 1.5 seconds
- Time to Interactive: < 3 seconds

## Backup & Recovery

### Data Backup

The dashboard is stateless. Important data is on the backend:

1. Regular database backups
2. Version control for code
3. Environment variable backups (secure)

### Recovery Steps

1. Restore backend database
2. Redeploy dashboard code
3. Clear browser cache if needed
4. Re-authenticate if necessary

## License & Support

This admin dashboard is part of Jawla Tours and is for authorized use only.

For additional support or questions, contact the development team.
