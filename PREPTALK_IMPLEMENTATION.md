# PrepTalk Implementation Notes

## Architecture Decisions

### 1. Polling vs WebSockets
**Decision**: Use polling (3-2 second intervals)
**Reason**: 
- Simplicity (no additional server setup needed)
- Works with Supabase free tier
- Adequate for placement seeker use case
- Can be upgraded to WebSockets in future

**Implementation**:
```typescript
// Refresh pending requests every 3 seconds
const interval = setInterval(fetchRequests, 3000);
return () => clearInterval(interval);
```

### 2. Conversation User ID Ordering
**Issue**: Two users can create conversations in different orders
**Solution**: Always store smaller UUID first

```typescript
const user_one_id = requesterId < receiverId ? requesterId : receiverId;
const user_two_id = requesterId < receiverId ? receiverId : requesterId;
```

This ensures unique constraint works correctly.

### 3. Chat Request Unique Constraint
**Design**: `UNIQUE(requester_id, receiver_id, experience_id)`
**Reason**: 
- Prevents duplicate requests for same experience interaction
- Allows same users to connect on different experiences
- Prevents spam

### 4. Error Handling Strategy
**Database Errors**: Bubble up with console.error + user toast
**Validation**: Check on client AND server (DB constraints)
**User Friendly**: Generic error messages for security

## Integration Points

### With AuthContext
```typescript
const { user } = useAuth();
// user.id used for all operations
// Requires user to be logged in (ProtectedRoute)
```

### With Supabase
- Uses existing supabase client from lib/supabase.ts
- Extends schema with 3 new tables
- No changes to existing tables needed

### With Navbar
- Added new nav item to navLinks array
- Used existing styling (glass-card, hover effects)
- Icons from lucide-react library

### With Experiences Page
- Connect button added to existing card layout
- Uses handleConnect function pattern (like handleToggleLike)
- Maintains UI consistency

## Code Patterns Used

### Service Layer Pattern
Each service exports async functions:
```typescript
export async function functionName(params) {
  try {
    // Logic
    return result;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}
```

### React Hooks Pattern
```typescript
const [state, setState] = useState(initialValue);
const [loading, setLoading] = useState(false);
const intervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  // Setup
  return () => {
    // Cleanup (important for intervals)
  };
}, [dependencies]);
```

### Error Handling Pattern
```typescript
try {
  // Operation
} catch (err) {
  console.error("Operation:", err);
  toast.error("User friendly message");
} finally {
  setProcessing(false);
}
```

## Performance Considerations

### Message Loading
- Limit to last 50 messages: `messages.limit(50)`
- Change if needed: `getMessages(conversationId, customLimit)`

### Database Indices
Created for common queries:
```sql
CREATE INDEX idx_chat_requests_receiver ON chat_requests(receiver_id, status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
```

### Polling Overhead
- 3-4 API calls per second per active user
- Acceptable for small user base
- Monitor if scaling up

## Security Considerations

### Row Level Security (RLS)
**Not implemented in v1**
- All authenticated users can see all messages
- Assume small trusted group
- Should be added before production with many users

**RLS Policy Examples** (for future):
```sql
-- Only sender/receiver can view conversation
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (auth.uid() IN (user_one_id, user_two_id));

-- Only sender can query messages they're part of
CREATE POLICY "Users can view conversation messages"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE auth.uid() IN (user_one_id, user_two_id)
  )
);
```

### XSS Prevention
- Using React (automatically escapes text)
- Message content sanitized before display
- No HTML/script execution in messages

### CSRF Protection
- Supabase handles JWT tokens
- Each request includes auth token
- No custom CSRF needed

## Type Safety

### Interface Definitions
```typescript
interface ChatRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  // ...
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
```

### Strict Type Checking
- All async functions return typed results
- User input validated before sending
- Cast types only when necessary (e.g., `as any`)

## Testing Considerations

### Unit Testing (Can be added)
```typescript
// chatRequestService.test.ts
describe('sendChatRequest', () => {
  it('should throw error for same user', async () => {
    expect(sendChatRequest('id1', 'id1', 'exp1')).rejects.toThrow();
  });
});
```

### Integration Testing
- Create test users via Supabase
- Call services in sequence
- Verify database state

## Monitoring & Debugging

### Console Logs
Service functions include detailed logging:
```typescript
console.error("Error fetching messages:", err);
```

### Toast Notifications
User-visible feedback via sonner:
```typescript
toast.success("Message sent!");
toast.error("Failed to send message");
```

### Browser DevTools
- Network tab: Check API calls to Supabase
- Console tab: View error logs
- Application tab: Check localStorage

## Maintenance Tasks

### Regular (Monthly)
- [ ] Check error logs in browser console
- [ ] Monitor polling frequency (adjust if needed)
- [ ] Check for unused conversations

### Quarterly
- [ ] Review database size
- [ ] Analyze message patterns
- [ ] Consider caching improvements

### As Needed
- [ ] Clean up old conversations (archive)
- [ ] Add RLS policies if multi-tenant
- [ ] Upgrade to WebSockets if scaling

## Scalability

### Current Limits
- Up to ~100 concurrent users reasonable
- Polling creates ~3-4 requests/sec/user
- Message history limited to 50

### Optimization Strategies
1. **Pagination**: Load messages in chunks
2. **WebSockets**: Replace polling for real-time
3. **Caching**: Client-side message cache
4. **CDN**: Cache user profile data

## Dependencies

### No New Dependencies Added
- Uses existing libraries:
  - lucide-react (icons)
  - sonner (notifications)
  - react-router (routing)
  - supabase (database)

### Version Compatibility
- React 18+
- TypeScript 4.9+
- Supabase JS SDK ^2.0

## Known Limitations

1. **No message editing**: Messages permanent once sent
2. **No message deletion**: Privacy concern
3. **No group chats**: Only 1-1 conversations
4. **No file sharing**: Text only
5. **No encryption**: All messages in plaintext
6. **Polling latency**: 2-3 second delay

## Future Improvements Order of Priority

1. **High**: Add RLS policies (security)
2. **High**: Message pagination (performance)
3. **Medium**: Typing indicators (UX)
4. **Medium**: Read receipts (UX)
5. **Medium**: WebSockets real-time (performance)
6. **Low**: Message reactions (feature)
7. **Low**: Group chats (feature)

## Configuration

### Environment Variables
No new env vars needed. Uses existing:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Supabase Setup
Tables created automatically via migrations.
No manual SQL needed.

### Deployment Notes
- All code is frontend (no new backend services)
- Works with existing Supabase project
- No additional environment config needed
- Can deploy as usual with existing CI/CD

## Resources

- Supabase Docs: https://supabase.com/docs
- React Hooks: https://react.dev/reference/react
- TypeScript: https://www.typescriptlang.org/docs/
- Project Tailwind: https://tailwindcss.com/docs
