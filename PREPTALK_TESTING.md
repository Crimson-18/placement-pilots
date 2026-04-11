# PrepTalk - Quick Start & Testing Guide

## What's New? 🎉

PrepTalk is a new messaging feature that lets users connect and chat based on interview experiences!

## Files Created

```
src/
├── lib/
│   ├── chatRequestService.ts      (Handle connection requests)
│   ├── messageService.ts           (Handle messages)
│   └── conversationService.ts      (Manage conversations)
└── pages/
    └── PrepTalk.tsx                (Main messaging page)
```

## Files Modified

- `src/App.tsx` - Added `/preptalk` route
- `src/components/Navbar.tsx` - Added PrepTalk nav link
- `src/pages/Experiences.tsx` - Added Connect button

## Database Tables Created

1. **chat_requests** - Track connection requests
2. **conversations** - Store conversation metadata  
3. **messages** - Store actual messages

## How to Test

### Setup
1. You need **2 user accounts** to test the messaging
2. Both users should be logged in (different browsers or incognito windows)

### Test Scenario

**Step 1: User A sends connect request**
- User A logs in
- Go to `/experiences`
- Find a post by User B
- Click the blue "Connect" button
- Should redirect to PrepTalk page
- Should see message: "Connect request sent to [User B Name]!"

**Step 2: User B accepts request**
- User B logs in (different session)
- Go to `/preptalk`
- Should see pending request from User A in "Connect Requests" section
- Click "Accept" button
- Request moves to active conversation
- Can now see User A in Messages list

**Step 3: Both users can chat**
- Both should see each other in their conversations
- Type message in input field at bottom
- Click send button (arrow icon)
- Messages should appear in real-time (within 2-3 seconds)
- Own messages appear on right (blue)
- Other user's messages appear on left (gray)

**Step 4: Test rejection**
- User A sends another request to User B (different experience)
- User B clicks "Reject" button
- Request disappears from pending
- Should return to initial state

## URL & Navigation

- **Main Page**: `http://localhost:5173/preptalk`
- **Via Navbar**: Home → Click "PrepTalk" link (MessageCircle icon)
- **From Experiences**: Click "Connect" button on any post

## UI Sections in PrepTalk

### Left Sidebar
```
[Connect Requests]  ← Pending requests to accept/reject
│
[Messages]          ← Active conversations
├─ User Name 1      ← Last message preview
├─ User Name 2
└─ User Name 3
```

### Right Chat Area
```
[Header: User Name]
├─ Email address
│
[Messages List]
├─ My message (right, blue)
├─ Their message (left, gray)
└─ Timestamps
│
[Input Field] [Send Button]
```

## Expected Behavior

✅ **Send Request:**
- Button changes to "Connecting..." while processing
- Creates record in chat_requests table
- Redirects to PrepTalk immediately
- Shows success message

✅ **Accept Request:**
- Creates new conversation
- Moves to active conversations list
- Button changes back to normal
- Shows success toast

✅ **Send Message:**
- Input disabled while sending
- Message appears immediately in UI
- Other user sees it within 2-3 seconds
- Timestamps show when message was sent

✅ **Auto-refresh:**
- Pending requests update every 3 seconds
- Conversations update every 3 seconds
- Messages update every 2 seconds when conversation is open

## Common Issues & Troubleshooting

### Issue: Can't see Connect button
**Solution**: Make sure you're on the `/experiences` page and logged in

### Issue: Button shows "Connecting..." forever
**Solution**: Check browser console for errors (F12). Make sure both users exist in database.

### Issue: Messages not appearing
**Solution**: 
- Check that conversation was created (both users should see each other)
- Try refreshing the page
- Wait 2-3 seconds for automatic refresh
- Check browser console for errors

### Issue: Can't accept request
**Solution**: Make sure you're logged in as the user who received the request (receiver_id)

## Testing Edge Cases

1. **Self-connect**: Try connecting to your own experience
   - Expected: Error message "Cannot send chat request to yourself"

2. **Duplicate request**: Try sending another request to same user
   - Expected: Error message "Chat request already exists"

3. **Different experiences**: Send requests to same user on different posts
   - Expected: Should appear as separate requests

4. **Message validation**: Try sending empty message
   - Expected: Input prevented, no message sent

5. **Concurrent messages**: Both users type and send at same time
   - Expected: Both messages appear in order

## Performance Notes

- First load may take 2-3 seconds (fetching requests/conversations)
- Messages load with up to 50 message limit initially
- Real-time feel achieved through 2-3 second polling
- No encryption yet (v1 - simple approach)

## Next Steps (Future Features)

- [ ] Typing indicators
- [ ] Message search
- [ ] Notification badges
- [ ] WebSocket real-time (replace polling)
- [ ] Message reactions
- [ ] Group chats
- [ ] File sharing

## Debugging

**Enable Console Logs:**
- Open browser DevTools (F12)
- Go to Console tab
- You'll see logs for all service calls

**Check Database:**
- Go to Supabase dashboard
- View tables: chat_requests, conversations, messages
- Verify data is being created correctly

**Test with cURL (Optional):**
```bash
# Test Supabase connection
curl -X GET "https://[YOUR-PROJECT].supabase.co/rest/v1/conversations" \
  -H "Authorization: Bearer [YOUR-ANON-KEY]" \
  -H "Content-Type: application/json"
```

## Support

Check `PREPTALK_FEATURE.md` for complete documentation of
- Database schema
- Service functions
- UI components
- Architecture overview
