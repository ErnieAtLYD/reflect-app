# Database Setup for Task 9B: Feedback Storage

## Overview

This directory contains the database migration scripts and setup documentation for the feedback storage system.

## Migration Files

- `001_create_feedback_table.sql` - Creates the feedback table with proper schema and indexes

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at https://app.supabase.com
2. Navigate to Settings > API in your project
3. Copy your project URL and anon key

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

For server-side operations (migrations), also add:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Running Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `001_create_feedback_table.sql`
4. Execute the SQL to create the table and indexes

### 4. Verify Setup

You can verify the setup by:

1. Checking the table exists in the Table Editor
2. Running the application and submitting feedback
3. Checking the feedback table for new entries

## Database Schema

### feedback table

- `feedback_id` (UUID, Primary Key) - Auto-generated unique identifier
- `reflection_id` (VARCHAR(255)) - Links feedback to AI reflection responses
- `feedback_type` (VARCHAR(10)) - Either 'positive' or 'negative'
- `user_agent` (TEXT, Nullable) - Browser/device information for context
- `created_at` (TIMESTAMP WITH TIME ZONE) - Automatic timestamp

### Indexes

- `idx_feedback_reflection_id` - For querying feedback by reflection
- `idx_feedback_created_at` - For time-based queries and cleanup

## Features

- Anonymous feedback collection
- User-agent capture for device context
- Proper indexing for performance
- ACID transactions for data integrity
- Type-safe operations with TypeScript
- Rate limiting and abuse prevention
- Comprehensive error handling

## API Usage

The feedback system exposes a POST endpoint at `/api/feedback`:

```typescript
// Example request
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reflection_id: 'refl_123_abc',
    feedback_type: 'positive',
  }),
})
```

## Security Considerations

- All data is anonymous (no user identification)
- Rate limiting prevents abuse (5 requests per minute per IP)
- Input validation prevents SQL injection
- User-agent length is limited to prevent overflow
- Environment variables protect database credentials

## Testing

- Unit tests: `src/lib/__tests__/feedback-storage.test.ts`
- Integration tests: `src/app/api/feedback/__tests__/route.test.ts`
- Type validation tests: `src/types/__tests__/database.test.ts`

Run tests with:

```bash
pnpm test src/lib/__tests__/feedback-storage.test.ts
pnpm test src/app/api/feedback/__tests__/route.test.ts
pnpm test src/types/__tests__/database.test.ts
```
