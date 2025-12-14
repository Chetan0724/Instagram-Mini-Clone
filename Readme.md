# Instagram Clone

![Demo Image 1](./assets/demo1.png)
![Demo Image 2](./assets/demo2.png)

A full-stack Instagram clone built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (signup/login with JWT)
- Create posts with image upload
- Like/unlike posts
- Comment on posts
- Follow/unfollow users
- User profiles with post grid
- Feed with infinite scroll
- Search users
- Image upload to Cloudinary

## Tech Stack

**Frontend:**

- React
- React Router
- Tailwind CSS
- Axios
- React Hook Form + Zod validation
- React Hot Toast

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (access + refresh tokens)
- Cloudinary
- Bcrypt
- Multer

## Database Schema

### Collections

**Users**

- username, email, password (hashed), fullName, bio, profileImage
- followersCount, followingCount

**Posts**

- userId (ref: User), imageUrl, caption
- likesCount, commentsCount

**Comments**

- userId (ref: User), postId (ref: Post), text

**Likes**

- userId (ref: User), postId (ref: Post)
- Unique constraint on (userId, postId)

**Follows**

- followerId (ref: User), followingId (ref: User)
- Unique constraint on (followerId, followingId)

**Tokens**

- userId (ref: User), refreshToken, expiresAt
- TTL index for auto-expiry

## Project Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
PORT=
MONGODB_URI=mongodb:
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

4. Create upload directory:

```bash
mkdir -p public/uploads
```

5. Start server:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users/me` - Get current user
- `GET /api/users/:username` - Get user profile
- `GET /api/users/:username/posts` - Get user posts
- `GET /api/users/search?query=` - Search users

### Posts

- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed
- `GET /api/posts/:postId` - Get single post
- `GET /api/posts/:postId/comments` - Get post comments

### Comments

- `POST /api/comments/:postId` - Add comment

### Likes

- `POST /api/likes/:postId` - Like post
- `DELETE /api/likes/:postId` - Unlike post
- `GET /api/likes/:postId` - Get post likes

### Follows

- `POST /api/follows/:userId` - Follow user
- `DELETE /api/follows/:userId` - Unfollow user
- `GET /api/follows/:userId/followers` - Get followers
- `GET /api/follows/:userId/following` - Get following

All endpoints except auth require `Authorization: Bearer <token>` header.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database & Cloudinary config
│   ├── models/         # Mongoose models
│   ├── controllers/    # Route controllers
│   ├── routes/         # API routes
│   ├── middlewares/    # Auth, upload, validation
│   ├── validations/    # Zod schemas
│   └── utils/          # Helper functions
└── public/uploads/     # Temporary file storage

frontend/
├── src/
│   ├── api/            # Axios config & endpoints
│   ├── components/     # React components
│   ├── contexts/       # Auth context
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utils & validators
│   └── pages/          # Page components
```

## Key Features Implementation

**Authentication:**

- Access tokens stored in localStorage
- Refresh tokens in httpOnly cookies
- Automatic token refresh on 401 errors
- Token rotation for enhanced security

**Image Upload:**

- Local temporary storage with Multer
- Upload to Cloudinary
- Automatic cleanup after upload
- File type and size validation

**Pagination:**

- Cursor-based pagination for all lists
- Infinite scroll on frontend
- Efficient database queries with indexes

**Real-time Updates:**

- Optimistic UI updates for likes/follows
- Instant feedback with toast notifications


## Notes

- Images are temporarily stored in `backend/public/temp` before uploading to Cloudinary
- Refresh tokens auto-expire after 7 days using MongoDB TTL index
- All passwords are hashed with bcrypt (10 rounds)
- CORS is configured to allow requests from frontend origin only
