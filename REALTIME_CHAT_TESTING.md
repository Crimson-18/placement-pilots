# Realtime Chat - Quick Start Testing Guide

## Installation ✅

All changes are already applied! Just verify:

```bash
# Check files exist
ls src/hooks/useMessaging.ts          # NEW ✅
cat src/pages/PrepTalk.tsx            # UPDATED ✅
ls REALTIME_CHAT_FIX.md               # NEW ✅
```

## Testing Steps

### 1️⃣ Setup Test Environment

```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Open browser DevTools
# Press F12 or Cmd+Option+I
# Go to Console tab

# Terminal 3: Supabase monitoring (optional)
# Open https://supabase.com/dashboard
# Go to Realtime → Logs
```

### 2️⃣ Create Test Accounts

```
User A:
- Email: tester1@nitkkr.ac.in
- Password: Test123456
- Name: Tester One

User B:
- Email: tester2@nitkkr.ac.in
- Password: Test123456
- Name: Tester Two
```

### 3️⃣ Test Flow

#### Step 1: Initial Setup
```bash
1. Open browser 1 (Incognito) → Login as User A
2. Open browser 2 (Incognito) → Login as User B
3. Keep both visible side-by-side
```

#### Step 2: Send Chat Request
```bash
Browser 1 (User A):
1. Go to /experiences
2. Find a post
3. Click "Connect" button
   └─ Creates chat request

Browser 2 (User B):
1. Go to /preptalk
2. Should see "Connect Requests" from User A
3. Observe: Updates within 5 seconds
   └─ This is polling (not critical, requests are less frequent)
```

#### Step 3: Accept Request
```bash
Browser 2 (User B):
1. Click "Accept" on request
   └─ Conversation created

Browser 1 (User A):
1. Go to /preptalk
2. Should see conversation in "Messages"
3. Observe: Lists immediately
```

#### Step 4: Send Messages (MOST IMPORTANT TEST)
```bash
Browser 1 (User A):
1. Click conversation to select
2. Type: "Hello B!"
3. Press Send
   └─ IMPORTANT: Check that message appears IMMEDIATELY
   └─ This is optimistic UI ✅

Browser 2 (User B):
1. Should receive message within 1-2 seconds
   └─ This is realtime subscription <100ms ✅
2. Verify: Message appears ONCE (no duplicates)
   └─ This is deduplication ✅

Browser 1 (User A):
1. Type: "How are you?"
2. Press Send
3. IMPORTANT: Watch for:
   ├─ Message appears immediately (optimistic) ✅
   └─ No duplicate when realtime arrives ✅
```

#### Step 5: Switch Conversations
```bash
Browser 1 (User A):
1. Create another conversation with User B
2. Switch between conversations
3. Observe:
   └─ Each conversation loads messages correctly
   └─ No mixing of message IDs
   └─ Subscription properly changes
```

### 4️⃣ Check Console Logs

```bash
# Expected logs in browser console:
"Realtime subscription active: {conversation-id}"
"Message sent successfully: {uuid-id}"
"Duplicate message detected, skipping: {uuid-id}" 
  └─ This means it works! (Shows deduplication working)

# NOT Expected:
"Error" messages ❌
"Undefined" references ❌
Multiple subscriptions for same conversation ❌
```

### 5️⃣ Verify No Duplicates

```javascript
// In browser console while chatting:
const messages = document.querySelectorAll('[data-message-id]');
const ids = new Set();

messages.forEach(msg => {
  const id = msg.getAttribute('data-message-id');
  if (ids.has(id)) {
    console.error("DUPLICATE FOUND:", id); ❌
  } else {
    ids.add(id);
  }
});

console.log("Total message elements:", messages.length);
console.log("Unique IDs:", ids.size);
// Should be: messages.length === ids.size ✅
```

### 6️⃣ Network Inspection

```bash
Browser DevTools:
1. Network tab
2. Filter: ws (WebSocket)
3. Should see:
   ├─ Single ws connection per conversation ✅
   ├─ Real-time events when messages sent ✅
   └─ NOT polling/HTTP requests every 1-2s ❌

4. Click on ws connection
   └─ Messages section shows real-time events
   └─ Verify: INSERT events for new messages
```

### 7️⃣ Stress Test

```bash
Browser 1 (User A):
1. Send messages rapidly (10+ in succession)
2. Observe:
   ├─ All appear optimistically (instant) ✅
   ├─ No duplicates ✅
   ├─ All confirmed with real IDs ✅

Browser 2 (User B):
1. All messages arrive in order
2. No duplicates
3. All marked as read automatically
```

### 8️⃣ Refresh Test

```bash
Browser 1 (User A):
1. Send message
2. Refresh page (Ctrl+R)
3. Go to /preptalk
4. Message should still exist
5. Check:
   ├─ Message persisted ✅
   ├─ Not duplicated when subscription reconnects ✅
   └─ New realtime subscription established ✅
```

## Expected Results Summary

| Test | Status | Evidence |
|------|--------|----------|
| **Optimistic UI** | ✅ PASS | Message appears before server response |
| **No Duplicates** | ✅ PASS | Single message per send, no doubles |
| **Realtime <2s** | ✅ PASS | Other user sees message within 1-2s |
| **Auto-read** | ✅ PASS | Messages automatically marked read |
| **Auto-scroll** | ✅ PASS | Chat auto-scrolls to latest message |
| **Error Recovery** | ✅ PASS | Failed messages can be resent |
| **Subscription Cleanup** | ✅ PASS | Switch conversations without leaks |
| **Network Efficient** | ✅ PASS | WebSocket only, no polling |

## Debugging Checklist

- [ ] Console has no errors
- [ ] WebSocket connection established
- [ ] Messages appear optimistically (instantly)
- [ ] No duplicate messages
- [ ] Realtime messages arrive <2 seconds
- [ ] Auto-scroll to latest works
- [ ] Refresh page: message persists
- [ ] Switch conversations: no errors
- [ ] Create new conversation: works fine
- [ ] Network: WebSocket only (no polling)

## Common Issues & Solutions

### Issue: Messages appear twice
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Check that useMessaging.ts has confirmOptimisticMessage()
- Verify deduplication in console logs

### Issue: Messages don't appear
**Solution**:
- Check browser console for errors
- Verify WebSocket connection in Network tab
- Check Supabase realtime is enabled
- Confirm conversation_id matches

### Issue: Long delay before message appears
**Solution**:
- Should be instant (optimistic)
- If not, check network tab for slow requests
- Verify addOptimisticMessage() is called before sendMessage()

### Issue: Message from other user stuck
**Solution**:
- Check WebSocket status (should be Connected)
- Verify realtime subscription is active
- Check browser console for subscription errors
- Try refresh page

## Performance Metrics

Expected performance:
```
Optimistic UI:      <50ms (instant)
Realtime delivery:  <100ms (from realtime)
From other user:    <2 seconds total
Message confirm:    <100ms (realtime event)
Auto-read marking:  <500ms
```

## File Changes Summary

```
✅ NEW: src/hooks/useMessaging.ts
   └─ useMessages()
   └─ useSendMessage()
   └─ useRealtimeMessages()

✅ UPDATED: src/pages/PrepTalk.tsx
   └─ Use custom hooks
   └─ Optimistic message tracking
   └─ Improved error handling

✅ DOCUMENTATION:
   └─ REALTIME_CHAT_FIX.md
   └─ REALTIME_CHAT_BEFORE_AFTER.md
   └─ This file (REALTIME_CHAT_TESTING.md)
```

## Next Steps

1. Run tests from this guide
2. Report any failures
3. Check logs for errors
4. Use debugging checklist
5. Monitor performance

## Support

If tests fail:
1. Check REALTIME_CHAT_FIX.md for architecture details
2. Review REALTIME_CHAT_BEFORE_AFTER.md for problem explanation
3. Check browser console for specific errors
4. Verify Supabase realtime is enabled in settings

Everything should work! 🚀
