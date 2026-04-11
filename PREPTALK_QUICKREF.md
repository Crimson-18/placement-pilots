# PrepTalk - Quick Reference Card

## 🎯 What Was Built

A complete P2P messaging system for placement seekers to connect and chat based on interview experiences.

---

## 📂 File Structure

```
placement-pilot/
├── src/
│   ├── lib/
│   │   ├── chatRequestService.ts      ← NEW (156 lines)
│   │   ├── messageService.ts          ← NEW (96 lines)
│   │   └── conversationService.ts     ← NEW (100 lines)
│   ├── pages/
│   │   ├── PrepTalk.tsx               ← NEW (395 lines)
│   │   ├── Experiences.tsx            ← UPDATED (+80 lines)
│   │   └── ...
│   ├── App.tsx                        ← UPDATED (+2 lines)
│   └── components/
│       ├── Navbar.tsx                 ← UPDATED (+4 lines)
│       └── ...
│
├── PREPTALK_SUMMARY.md                ← THIS FILE (You are here)
├── PREPTALK_FEATURE.md                ← Full technical docs
├── PREPTALK_TESTING.md                ← Testing & debugging guide
├── PREPTALK_IMPLEMENTATION.md         ← Developer reference
└── ...
```

---

## 🚀 Quick Start (Testing)

### Setup
1. You need **2 test user accounts**
2. Both should be logged in (different browser/incognito)

### Test Flow
```
User A: Experiences → Click "Connect" on post by User B
User A: Auto-redirects to PrepTalk (success message shown)

User B: Opens PrepTalk page
User B: Sees pending request from User A
User B: Clicks "Accept"

Both: Can now see each other in Messages list
Both: Click conversation → Start chatting!
```

### URLs
- **PrepTalk Page**: `http://localhost:5173/preptalk`
- **Experiences**: `http://localhost:5173/experiences`
- **Navbar**: **PrepTalk** link (MessageCircle icon)

---

## 💻 Service Functions Quick Reference

### Chat Requests
```typescript
// Send request
await sendChatRequest(userId, targetUserId, experienceId);

// Get pending requests
const requests = await getPendingChatRequests(userId);

// Accept request
const convId = await acceptChatRequest(requestId, userId);

// Reject request
await rejectChatRequest(requestId, userId);

// Check if exists
const existing = await checkChatRequestExists(user1Id, user2Id);
```

### Conversations
```typescript
// Get all conversations
const convs = await getUserConversations(userId);

// Get specific conversation
const conv = await getConversationBetweenUsers(userId1, userId2);

// Update last message
await updateConversationLastMessage(conversationId);
```

### Messages
```typescript
// Send message
const msg = await sendMessage(conversationId, senderId, content);

// Get messages
const messages = await getMessages(conversationId);

// Mark as read
await markMessagesAsRead(conversationId, userId);

// Get unread count
const count = await getUnreadCount(conversationId, userId);
```

---

## 📊 Database Tables (Created)

### chat_requests
```sql
id | requester_id | receiver_id | experience_id | status | created_at
```
**Unique on**: (requester_id, receiver_id, experience_id)

### conversations
```sql
id | user_one_id | user_two_id | last_message_at | created_at
```
**Unique on**: (user_one_id, user_two_id)

### messages
```sql
id | conversation_id | sender_id | content | read_at | created_at
```

---

## 🎨 UI Locations

### PrepTalk Page Layout
```
┌─────────────────────────────────────────┐
│   NAVBAR (PrepTalk link added)          │
├──────────────┬──────────────────────────┤
│ LEFT         │ RIGHT                    │
│ Pending      │ Chat Interface           │
│ Requests     │ (when conversation open) │
│              │                          │
│ Conver-      │ Message history          │
│ sations      │                          │
│ List         │ Message input + send     │
└──────────────┴──────────────────────────┘
```

### Connect Button Location
**Experiences Page** → Each post has:
- [♥ Like] [💬 Connect]

---

## ⚡ Real-Time Behavior

| Event | Refresh Rate |
|-------|--------------|
| Pending Requests | Every 3 seconds |
| Conversations List | Every 3 seconds |
| Messages | Every 2 seconds |

**Note**: Refresh only happens when not sending (prevents conflicts)

---

## ✅ Error Handling Examples

```typescript
// Input validation
if (!messageContent.trim()) {
  // Message not sent
}

// User cannot connect to themselves
if (requesterId === receiverId) {
  throw new Error("Cannot send chat request to yourself");
}

// Prevent duplicate requests
const existing = await checkChatRequestExists(userId, targetId);
if (existing?.status !== 'rejected') {
  throw new Error("Chat request already exists");
}

// User feedback
toast.success("Message sent!");
toast.error("Failed to send message");
```

---

## 🔧 Configuration

### No New Configuration Needed!
- Uses existing Supabase project
- No new environment variables
- Works with current database

### To Customize Polling Rates
Edit `PrepTalk.tsx`:
```typescript
// Line ~65-70: Change from 3000 to desired ms
const interval = setInterval(fetchRequests, 3000);

// Line ~90: Change from 3000 to desired ms
const interval = setInterval(fetchConversations, 3000);

// Line ~123: Change from 2000 to desired ms
messageRefreshInterval.current = setInterval(fetchMessages, 2000);
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Connect button not showing | Not logged in | Login first |
| No pending requests shown | Wrong user | Log in as receiver |
| Messages not sending | Empty input | Type before sending |
| Messages delayed | Polling cycle | Wait 2-3 seconds |
| Can't accept request | Wrong user | Switch to receiver account |
| Duplicate request error | Already sent | Check pending requests |

---

## 📈 Performance Tips

### If Many Active Conversations
```typescript
// Reduce polling frequency in PrepTalk.tsx
const interval = setInterval(fetchConversations, 5000); // 5 sec instead of 3
```

### If Need Faster Messages
```typescript
// Increase polling frequency
messageRefreshInterval.current = setInterval(fetchMessages, 1000); // 1 sec instead of 2
```

### Message History Limit
Change in `messageService.ts`:
```typescript
const messages = await getMessages(conversationId, 100); // 100 instead of 50
```

---

## 🔐 Security Notes

### Current (v1 - Simple)
✅ Login required (uses ProtectedRoute)
✅ JWT token validation via Supabase
✅ Database constraints prevent invalid data
⚠️ No row-level security (all users see all messages)
⚠️ No message encryption
⚠️ No rate limiting

### For Production (Phase 2+)
- [ ] Add Row-Level Security policies
- [ ] Add message encryption
- [ ] Add rate limiting
- [ ] Add user blocking
- [ ] Add content moderation

---

## 🧪 Testing Checklist

**Basic Flow**
- [ ] Create 2 user accounts
- [ ] User A sends connect request
- [ ] User B accepts request
- [ ] Both users can send/receive messages
- [ ] Messages appear with timestamps
- [ ] Messages auto-refresh in real-time

**Edge Cases**
- [ ] Try self-connect (should error)
- [ ] Try duplicate request (should error)
- [ ] Send empty message (should prevent)
- [ ] Reject request (should remove)
- [ ] Request on different experiences (should allow)

**UI/UX**
- [ ] Page responsive on mobile
- [ ] Buttons disabled during operation
- [ ] Error messages are helpful
- [ ] Auto-scroll to latest message
- [ ] No console errors

---

## 📚 Documentation Hierarchy

```
START HERE
    ↓
PREPTALK_SUMMARY.md (this file) ← Complete overview
    ↓
PREPTALK_TESTING.md ← How to test
    ↓
PREPTALK_FEATURE.md ← Full technical details
    ↓
PREPTALK_IMPLEMENTATION.md ← Developer deep-dive
```

---

## 🎓 Learning Path

### For Basic Users
1. Read this Quick Reference
2. Follow PREPTALK_TESTING.md to test
3. Use the feature!

### For Developers
1. Review PREPTALK_FEATURE.md for architecture
2. Study the service files for patterns
3. Check PREPTALK_IMPLEMENTATION.md for best practices
4. Examine PrepTalk.tsx for component patterns

### For Maintainers
1. Read PREPTALK_IMPLEMENTATION.md
2. Understand code patterns & decisions
3. Follow maintenance checklist
4. Plan Phase 2 improvements

---

## 🚀 Next Steps

### Right Now
```bash
# Test the feature!
npm run dev
# Open http://localhost:5173
# Create 2 accounts and follow test flow
```

### This Week
- [ ] Full testing with team
- [ ] Gather user feedback
- [ ] Document any bugs/issues
- [ ] Consider UI improvements

### Next Week
- [ ] Fix bugs found during testing
- [ ] Optimize based on feedback
- [ ] Plan Phase 2 features

### Next Month
- [ ] Implement read receipts
- [ ] Add typing indicators
- [ ] Consider WebSocket upgrade
- [ ] Expand feature set

---

## 💬 Need Help?

### Check These Files First
1. **How does it work?** → PREPTALK_FEATURE.md
2. **How to test?** → PREPTALK_TESTING.md
3. **How to modify?** → PREPTALK_IMPLEMENTATION.md
4. **Quick answer?** → This file

### Debug Steps
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for error messages
4. Look at Network calls to Supabase
5. Verify database records in Supabase dashboard

---

## 📊 Stats

- **Files Created**: 3 services + 1 page = 4 files
- **Files Modified**: 3 files
- **Total Lines Added**: ~833 lines
- **Database Tables**: 3 new tables
- **Service Functions**: 13 functions
- **Zero Errors**: ✅ TypeScript strict mode passing
- **Documentation**: 4 comprehensive guides

---

**Version**: 1.0 (Initial Release)
**Status**: ✅ Ready for Testing
**Last Updated**: 2024-4-11

Enjoy! 🎉
