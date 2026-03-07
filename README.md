# Jawla Tours Admin Dashboard

A modern, full-featured admin dashboard for managing Jawla Tours booking and content system. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

**⚠️ ADMIN ONLY ACCESS**: This dashboard is restricted to users with Administrator privileges only. Regular users cannot access this system.

## Features

### Authentication
- Admin-only login system
- Forgot password functionality
- JWT-based authentication
- Secure token management
- Role validation (Admin access required)

### User Management
- View all users with search functionality
- Create new admin/user accounts
- Edit user details
- Delete users
- Admin role management

### Package Management
- View all travel packages
- Create new packages with detailed information
- Edit package details
- Manage included services
- Feature packages for homepage
- Delete packages
- Image support for packages

### Blog Management
- Create and publish blog posts
- HTML content editor
- SEO optimization (meta tags, slug, keywords)
- Tag management
- Draft and publish status
- Blog image support
- Full blog editing capabilities

### Booking Management
- View all package bookings
- Filter bookings by status
- Update booking status (Pending, Confirmed, Cancelled, Completed)
- View booking details and passenger information
- Track travel dates and special requests
- Booking statistics dashboard

### Admin Profile
- View and edit admin profile
- Change password
- Manage admin account information
- System information

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Library**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Custom Toast component

## Installation

1. **Navigate to the Dashboard directory:**
   ```bash
   cd Dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment configuration:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure your environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://back-jawla.tajera.net/api/v1/
   ```

## Running the Dashboard

### Development Mode
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Root page (redirects to dashboard)
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── dashboard/               # Admin dashboard pages
│       ├── page.tsx             # Dashboard overview
│       ├── users/page.tsx       # Users management
│       ├── packages/page.tsx    # Packages management
│       ├── blogs/page.tsx       # Blogs management
│       ├── bookings/page.tsx    # Bookings management
│       ├── profile/page.tsx     # Admin profile
│       └── profile/page.tsx     # Profile
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Dashboard header
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── DashboardLayout.tsx  # Main layout wrapper
│   │   └── AuthLayout.tsx       # Auth pages layout
│   └── ui/
│       ├── Button.tsx           # Button component
│       ├── Input.tsx            # Input component
│       ├── Textarea.tsx         # Textarea component
│       ├── Modal.tsx            # Modal component
│       ├── Toast.tsx            # Toast notifications
│       └── Loading.tsx          # Loading states
├── lib/
│   ├── api.ts                   # API service layer
│   └── utils.ts                 # Utility functions
├── store/
│   ├── useAuthStore.ts          # Authentication store
│   └── useAppStore.ts           # App state store
└── types/
    └── index.ts                 # TypeScript types
```

## API Integration

The dashboard integrates with the Jawla Tours API. All API methods are handled through the centralized API service (`src/lib/api.ts`).

### Available API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

#### Users (Admin only)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PATCH /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user
- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/profile` - Update profile
- `DELETE /api/v1/users/profile` - Deactivate account

#### Packages (Admin only for write operations)
- `GET /api/v1/packages` - Get all packages
- `GET /api/v1/packages/{slug}` - Get package by slug
- `POST /api/v1/packages` - Create package
- `PATCH /api/v1/packages/{id}` - Update package
- `DELETE /api/v1/packages/{id}` - Delete package

#### Blogs (Admin only for write operations)
- `GET /api/v1/blogs` - Get published blogs
- `GET /api/v1/blogs/admin/all` - Get all blogs (including drafts)
- `GET /api/v1/blogs/{slug}` - Get blog by slug
- `POST /api/v1/blogs` - Create blog
- `PATCH /api/v1/blogs/{id}` - Update blog
- `DELETE /api/v1/blogs/{id}` - Delete blog

#### Bookings (Admin only)
- `GET /api/v1/package-bookings` - Get all bookings
- `GET /api/v1/package-bookings/my-bookings` - Get user's bookings
- `POST /api/v1/package-bookings` - Create booking
- `PATCH /api/v1/package-bookings/{id}/status` - Update booking status

## State Management

### useAuthStore
Manages authentication state:
- User information
- Auth token
- Login/Register/Logout actions
- Profile fetching

### useAppStore
Manages global app state:
- Toast notifications
- Modal states (if needed)
- General app notifications

## Key Features Implemented

### 1. Dashboard Overview
- Statistics cards showing totals for users, packages, blogs, and bookings
- Recent bookings list
- Quick action buttons for common tasks

### 2. User Management
- Complete CRUD operations for user accounts
- Search functionality
- Role management (Admin/User)
- Password management for new users
- Created date tracking

### 3. Package Management
- Full package details management
- Image upload support
- Service list management with add/remove functionality
- Featured package toggling
- Price and currency management
- Search and filtering

### 4. Blog Management
- Rich HTML content support
- SEO optimization (meta tags, slug)
- Tag management
- Draft/Publish status toggling
- Image support
- Content preview capability

### 5. Booking Management
- Complete booking overview
- Status tracking with visual indicators
- Passenger information display
- Special requests handling
- Status update functionality
- Booking statistics

### 6. Authentication
- Login page with email/password
- Register page for new admins
- Forgot password with email verification
- Protected routes
- Token-based authentication

## Authentication Flow

1. User logs in with credentials
2. API returns JWT token and user data
3. Token is stored in localStorage
4. Token is automatically included in all API requests
5. If token expires (401), user is redirected to login
6. User can logout to clear token and session

## Error Handling

- API errors are caught and displayed as toast notifications
- Form validation errors are shown inline
- Network errors are handled gracefully
- User-friendly error messages

## Styling

The dashboard uses Tailwind CSS for styling with a consistent design system:

### Color Palette
- Primary: Blue (#3d47f5)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)
- Neutral: Gray scale

### Components
- Consistent button styles
- Input validation styling
- Modal dialogs
- Toast notifications
- Loading states
- Responsive layouts

## Performance Optimizations

- Code splitting with Next.js
- Image optimization
- Efficient state management with Zustand
- API request deduplication
- Client-side caching
- Lazy loading of components

## Security Features

- JWT-based authentication
- Protected API endpoints
- Secure token storage
- Password validation
- User role verification
- Protected routes

## Development Guidelines

### Adding New Features

1. Create the API service method if needed
2. Create the UI component(s)
3. Add state management if required
4. Implement error handling
5. Add toast notifications for user feedback
6. Test authentication scenarios

### Creating New Pages

1. Create folder under `src/app/dashboard/`
2. Create `page.tsx` file
3. Use `DashboardLayout` wrapper
4. Implement data fetching and state management
5. Add navigation link in Sidebar component

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend API is running
- Verify CORS settings on backend

### Authentication Issues
- Clear localStorage and try logging in again
- Check if token is valid
- Verify API credentials

### Build Issues
- Delete `.next` folder and rebuild
- Clear node_modules and reinstall dependencies
- Check TypeScript errors

## Future Enhancements

- [ ] Analytics dashboard with charts
- [ ] Email notification system
- [ ] Advanced search and filtering
- [ ] Bulk operations for users/packages
- [ ] Export to CSV functionality
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Role-based permission system
- [ ] Audit logs
- [ ] Two-factor authentication

## Support

For issues or questions regarding the admin dashboard, please refer to the API documentation (docs-api.json) or contact the development team.

## License

This admin dashboard is part of the Jawla Tours project and is intended for internal use only.
