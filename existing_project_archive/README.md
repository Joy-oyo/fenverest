# EventSwipe

A social event discovery and management platform where users can discover, create, and join events based on their interests and skill levels.

## Features

- User authentication (register/login)
- User roles (participant/organizer)
- Event discovery with difficulty levels (beginner/intermediate/advanced)
- Event creation and management
- Event participation
- Swipe interface for event discovery

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd eventswipe
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventswipe
JWT_SECRET=your_jwt_secret_key_here
```

4. Start MongoDB:
```bash
mongod
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Events
- GET /api/events - Get all events
- GET /api/events/:id - Get event details
- POST /api/events - Create new event (organizer only)
- PATCH /api/events/:id - Update event (organizer only)
- DELETE /api/events/:id - Delete event (organizer only)
- POST /api/events/:id/join - Join event
- POST /api/events/:id/leave - Leave event

## Frontend

The frontend is built with HTML, CSS, and JavaScript. The main interface is in `index.html`.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
