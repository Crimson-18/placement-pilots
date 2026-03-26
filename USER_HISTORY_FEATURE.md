# User History & Generated URLs Feature

## Overview
This feature tracks user activities (eligibility checks, experience posts, etc.) and stores them with unique IDs/URLs so users can access their history anytime they log into their dashboard.

## Database Schema

### 1. `eligibility_checks` Table
Stores every eligibility check a user performs:
```sql
- id (UUID)
- user_id (UUID) - Links to user
- cgpa (DECIMAL) - User's CGPA at time of check
- branch (TEXT) - User's branch
- skills (TEXT[]) - Skills they selected
- results (JSONB) - Full eligibility check results
- created_at (TIMESTAMP) - When check was performed
- updated_at (TIMESTAMP)
```

### 2. `user_activity_history` Table
Tracks all user activities:
```sql
- id (UUID)
- user_id (UUID) - Links to user
- activity_type (TEXT) - 'eligibility_check', 'experience_post', 'company_view'
- reference_id (UUID) - Links to the specific activity (e.g., check_id)
- description (TEXT) - Human-readable description
- created_at (TIMESTAMP)
```

## How It Works

### Step 1: User Checks Eligibility
1. User goes to `/eligibility` page
2. Fills in CGPA, Branch, and selects Skills
3. Clicks "Check Eligibility"
4. Results are calculated and displayed

### Step 2: Results are Saved
When user checks eligibility:
- `saveEligibilityCheck()` saves the result to database with unique ID
- `logUserActivity()` logs this activity for tracking
- Each check gets a shareable URL: `/eligibility?checkId={check_id}`

### Step 3: History Displayed on Dashboard
When user logs into dashboard:
- `getUserEligibilityHistory()` fetches all past checks for that user
- Shows last 5 checks with:
  - Branch and CGPA used
  - Number of skills selected
  - Date and time of check
  - "View Results" link to re-open that specific check

## Service Functions

### In `historyService.ts`:

```typescript
// Save eligibility check
saveEligibilityCheck(userId, cgpa, branch, skills, results)

// Get user's check history
getUserEligibilityHistory(userId)

// Get specific check by ID
getEligibilityCheckById(checkId)

// Delete check
deleteEligibilityCheck(checkId)

// Log activity
logUserActivity(userId, activityType, description, referenceId)

// Get activity history
getUserActivityHistory(userId, limit)
```

## Features

✅ **Unique URLs for Results** - Each check has unique ID for later access
✅ **Automatic Saving** - No manual save needed, happens automatically
✅ **History on Dashboard** - Users see their past checks when they log in
✅ **Privacy Protected** - RLS policies ensure users only see their own history
✅ **Activity Tracking** - All activities (eligibility, posts, etc.) are logged
✅ **Timestamps** - Each entry shows exactly when it was created
✅ **Easy Access** - "View Results" link to quickly re-view past checks

## User-Facing Flow

1. **Register/Login** → Dashboard loads
2. **Check Eligibility** → Results saved automatically with URL/ID
3. **View Dashboard** → See history of past checks
4. **Click "View Results"** → Loads that specific eligibility check again
5. **Share URL** → Can share `eligibility?checkId=...` with friends

## Future Enhancements

- Copy check URL button to share with friends
- Export check results as PDF
- Compare multiple checks over time
- Set reminders for rechecking eligibility
- Bulk delete old checks
- Search and filter history
- Email digest of recent checks

## Database Security

- **RLS Policies** enabled on both tables
- Users can only see/modify their own data
- Service role can perform admin operations
- All data is encrypted in transit (via HTTPS)

## Testing the Feature

1. **Create account** and verify email
2. **Go to Eligibility Checker** (Navbar → Eligibility)
3. **Fill form** with your CGPA, branch, and skills
4. **Click "Check Eligibility"** - wait for "Saving..." to complete
5. **Go to Dashboard** - scroll down to see "Your Eligibility Checks History"
6. **Click "View Results"** to re-open any past check

---

**Status**: ✅ Implemented and Ready to Test
