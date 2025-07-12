# Notification Server

A TypeScript-based notification service for the StackIt application using Express.js and PostgreSQL.

## Features

- JWT-based authentication
- CRUD operations for notifications
- PostgreSQL database with proper indexing
- TypeScript support with proper type definitions
- Comprehensive testing suite

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env-example` to `.env` and fill in your values:
   ```bash
   cp .env-example .env
   ```

   Required environment variables:
   - `JWT_SECRET`: Secret key for JWT token signing
   - `DATABASE_URL`: PostgreSQL connection string
   - `SOURCE_SERVER_URL`: URL of the main application server (optional)

3. **Setup the database:**
   ```bash
   npm run setup
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on port 3000.

## API Endpoints

### Authentication
- `GET /login/:userId` - Generate JWT token for testing (development only)

### Notifications
- `GET /notification/get` - Get all notifications for authenticated user
- `POST /notification/add` - Add a new notification
- `PATCH /notification/read/:notifId` - Mark notification as read
- `DELETE /notification/delete/:notifId` - Delete a notification

### Health Check
- `GET /` - Server health check

## Authentication

All notification endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Request/Response Examples

### Get Notifications
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/notification/get
```

Response:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "user_id": "user123",
      "type": "question_answered",
      "message": "Your question has been answered",
      "actor_user_id": "user456",
      "question_id": "q789",
      "answer_id": "a101",
      "comment_id": null,
      "is_read": false,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Add Notification
```bash
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user123",
       "type": "question_answered",
       "message": "Your question has been answered",
       "actor_user_id": "user456",
       "question_id": "q789"
     }' \
     http://localhost:3000/notification/add
```

Response:
```json
{
  "message": "Notification added successfully",
  "notificationId": "uuid"
}
```

### Mark as Read
```bash
curl -X PATCH \
     -H "Authorization: Bearer <token>" \
     http://localhost:3000/notification/read/<notification-id>
```

### Delete Notification
```bash
curl -X DELETE \
     -H "Authorization: Bearer <token>" \
     http://localhost:3000/notification/delete/<notification-id>
```

## Notification Types

Common notification types include:
- `question_answered` - When someone answers your question
- `comment_added` - When someone comments on your content
- `question_liked` - When someone likes your question
- `answer_liked` - When someone likes your answer
- `mention` - When someone mentions you

## Testing

### Run the test suite:
```bash
npm run test-routes
```

This will run a comprehensive test suite that covers:
- Health check
- Authentication
- CRUD operations
- Error handling
- Authorization checks

### Manual Testing

1. Start the server: `npm run dev`
2. Get a test token: `curl http://localhost:3000/login/testuser`
3. Use the token to test other endpoints

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run setup` - Initialize database schema
- `npm run test-routes` - Run API tests

### Database Schema

The notifications table includes:
- `id` (UUID, Primary Key)
- `user_id` (VARCHAR, Required)
- `type` (VARCHAR, Required)
- `message` (TEXT, Required)
- `actor_user_id` (VARCHAR, Optional)
- `question_id` (VARCHAR, Optional)
- `answer_id` (VARCHAR, Optional)
- `comment_id` (VARCHAR, Optional)
- `is_read` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Adding New Notification Types

1. Add the new type to your application logic
2. Ensure the type is properly validated
3. Update documentation and tests

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **JWT Token Invalid**
   - Check `JWT_SECRET` in `.env`
   - Ensure token is properly formatted in Authorization header

3. **Port Already in Use**
   - Change the port in `server.ts` or kill the process using port 3000

### Logs

The server logs important information to the console including:
- Server startup confirmation
- Database query errors
- Authentication failures

## Security Considerations

- JWT tokens expire after 1 hour
- All notification operations are user-scoped
- Input validation prevents SQL injection
- Authorization checks prevent unauthorized access

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Ensure proper error handling