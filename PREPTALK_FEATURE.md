# PrepTalk Messaging Feature Documentation

## Feature Overview

PrepTalk is a real-time messaging system that allows placement seekers to connect and chat with each other based on interview experiences they share.

## How It Works

### 1. **Connect Request Flow**
```
User A views Experience Post by User B
         ↓
User A clicks "Connect" button
         ↓
Chat Request sent to User B (status: pending)
         ↓
User A is redirected to PrepTalk page
         ↓
User B receives notification of connect request
         ↓
```

### 2. **Accept/Reject Request**
```
User B sees pending request from User A
         ↓
User B can Accept or Reject
         ↓
If Accepted: Conversation created → Both users can chat
If Rejected: Request deleted
         ↓
```

### 3. **Messaging**
```
ActiveConversations list on left side
         ↓
Click conversation to open chat
         ↓
View message history
         ↓
Type and send messages
         ↓
Messages appear in real-time (3-2 sec refresh)
```

## Database Schema

### chat_requests Table
```sql
id: UUID (Primary Key)
requester_id: UUID (Foreign Key → users.id)
receiver_id: UUID (Foreign Key → users.id)
experience_id: UUID (Foreign Key → experiences.id)
status: TEXT ('pending', 'accepted', 'rejected')
created_at: TIMESTAMP
updated_at: TIMESTAMP
UNIQUE(requester_id, receiver_id, experience_id)
```

### conversations Table
```sql
id: UUID (Primary Key)
user_one_id: UUID (Foreign Key → users.id)
user_two_id: UUID (Foreign Key → users.id)
last_message_at: TIMESTAMP
created_at: TIMESTAMP
updated_at: TIMESTAMP
UNIQUE(user_one_id, user_two_id)
```

### messages Table
```sql
id: UUID (Primary Key)
conversation_id: UUID (Foreign Key → conversations.id)
sender_id: UUID (Foreign Key → users.id)
content: TEXT
read_at: TIMESTAMP (nullable)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

## Services Created

### 1. **chatRequestService.ts**
Functions:
- `sendChatRequest()` - Create new chat request
- `getPendingChatRequests()` - Get all pending requests for a user
- `getSentChatRequests()` - Get requests sent by a user
- `acceptChatRequest()` - Accept request and create conversation
- `rejectChatRequest()` - Reject a request
- `checkChatRequestExists()` - Check if request exists between two users

### 2. **conversationService.ts**
Functions:
- `getUserConversations()` - Get all conversations for a user with last message
- `getConversationBetweenUsers()` - Get conversation between specific users
- `updateConversationLastMessage()` - Update last message timestamp

### 3. **messageService.ts**
Functions:
- `sendMessage()` - Send a message to a conversation
- `getMessages()` - Get all messages in a conversation
- `getUnreadCount()` - Get unread message count
- `markMessagesAsRead()` - Mark messages as read

## UI Components & Pages

### 1. **Experiences Page Updates**
- Added "Connect" button next to like button
- Button color: Primary (blue-teal shade)
- Icon: MessageCircle
- On click: Creates chat request and redirects to PrepTalk

### 2. **PrepTalk Page** (`src/pages/PrepTalk.tsx`)
Layout: 3-column responsive grid
```
┌─────────────────────────────────────────────────────┐
│                       NAVBAR                         │
├─────────────────┬───────────────────────────────────┤
│  LEFT SIDEBAR   │                                   │
│  - Pending      │      CHAT INTERFACE               │
│    Requests     │  - Header with user name          │
│  - Active       │  - Message history                │
│    Convs        │  - Message input                  │
└─────────────────┴───────────────────────────────────┘
```

**Left Sidebar:**
- Pending Requests section (with Accept/Reject buttons)
- Active Conversations list
- Click conversation to select it

**Chat Interface:**
- Shows user name in header
- Message history with timestamps
- Own messages on the right (primary color)
- Other user messages on the left (secondary color)
- Input field at bottom with send button
- Auto-scroll to latest message

### 3. **Navbar Update**
- Added PrepTalk link with MessageCircle icon
- Positioned in navigation menu

## Real-time Behavior

The application uses polling for real-time updates:
- Pending Requests: Refresh every 3 seconds
- Conversations: Refresh every 3 seconds  
- Messages: Refresh every 2 seconds (when conversation is selected)

## Error Handling

### Service Level
- Input validation (empty messages, invalid users)
- Unique constraint handling
- Proper error messages to user

### UI Level
- Toast notifications for success/error
- Loading states with spinners
- Disabled buttons during processing
- User-friendly error messages

## User Flow Example

1. **User A** opens Experiences page
2. **User A** sees interview post by User B (about company X)
3. **User A** clicks "Connect" button
4. Chat request sent to User B
5. **User A** redirected to PrepTalk
6. **User B** logs in and goes to PrepTalk
7. **User B** sees pending request from User A
8. **User B** clicks "Accept"
9. Conversation is created
10. Both users can now chat about the interview

## Features Implemented

✅ Chat request system (send, accept, reject)
✅ Real-time conversation management
✅ Message sending and receiving
✅ Auto-scroll to new messages
✅ Message history with timestamps
✅ User-friendly interface with glass-card design
✅ Proper error handling and notifications
✅ Protected routes (login required)
✅ Responsive design (mobile-friendly)
✅ Real-time polling (3-2 sec refresh)

## Potential Future Enhancements

- [ ] Typing indicators ("User is typing...")
- [ ] Read receipts (checkmarks for read messages)
- [ ] Message search functionality
- [ ] Block user functionality
- [ ] Group conversations
- [ ] Message attachment support
- [ ] WebSocket for true real-time (vs polling)
- [ ] Notification badges in navbar
- [ ] Empty state designs
- [ ] Message reactions/emojis

## Testing Checklist

- [ ] Create two user accounts
- [ ] User A sends connect request on User B's experience
- [ ] User A redirected to PrepTalk
- [ ] User B sees pending request
- [ ] User B accepts request
- [ ] Conversation created for both
- [ ] Both can send messages
- [ ] Messages appear in real-time
- [ ] Can view message history
- [ ] Reject request removes it
- [ ] Cannot connect with yourself (validation)
- [ ] Already sent request shows error

## Configuration

No additional environment variables needed. Uses existing Supabase setup.

## Notes

- Simplicity first approach (no encryption in v1)
- Uses polling instead of WebSockets for simplicity
- Proper database indices for performance
- Unique constraints to prevent duplicate requests
- User IDs compared as strings to ensure consistent ordering in conversations
