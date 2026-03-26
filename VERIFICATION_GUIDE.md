# Experience Verification Guide

## Verified Boolean Field

All interview experiences now have a `verified` boolean field that controls whether they are publicly visible to all users.

### Default Behavior
- **New posts**: `verified = false` (pending admin review)
- **Status**: Users can see their own pending posts with "(pending verification)" status
- **Public visibility**: Only verified posts appear in the public Experiences page

### Verification Status Display

#### User Dashboard
- ✓ Green badge for verified experiences
- "pending" label for unverified experiences

#### Public Experiences Page
- ✓ Verified badge shown on verified posts
- "(pending verification)" text shown on unverified posts (in the review system)

#### PostExperience Form
Users see a message: "Your post will be pending verification. An admin will review and verify your experience before it appears publicly."

## Admin Verification Methods

### Method 1: Supabase Dashboard (Easiest)
1. Go to your Supabase Project Dashboard
2. Navigate to **SQL Editor**
3. Run queries to verify/unverify experiences:

```sql
-- Verify a specific experience
UPDATE public.experiences
SET verified = true
WHERE id = 'experience-id-here';

-- Get all unverified experiences
SELECT id, company, role, user_id, created_at, verified
FROM public.experiences
WHERE verified = false
ORDER BY created_at ASC;

-- Unverify an experience
UPDATE public.experiences
SET verified = false
WHERE id = 'experience-id-here';
```

### Method 2: Using Backend API (Required for Custom Admin Panel)
If you want to build a dedicated admin panel, use these service functions:

```typescript
import {
  verifyExperience,
  unverifyExperience,
  getUnverifiedExperiencesWithUsers,
  getVerifiedExperiencesWithUsers
} from '@/lib/experienceService';

// Get all unverified experiences
const unverifiedExps = await getUnverifiedExperiencesWithUsers();

// Verify an experience
await verifyExperience(experienceId);

// Unverify an experience
await unverifyExperience(experienceId);

// Get only verified experiences
const verifiedExps = await getVerifiedExperiencesWithUsers();
```

## RLS Policies
- Users can read all experiences
- Only admins can modify the `verified` field
- Users cannot modify their own `verified` field (enforced by RLS)

## Future: Admin Panel
Consider building an admin panel with:
1. List of unverified experiences
2. Buttons to verify/reject experiences
3. Bulk verification actions
4. Audit log of verification actions

Create a new page: `/src/pages/AdminPanel.tsx`

Example route:
```typescript
<Route path="/admin/experiences" element={<AdminVerification />} />
```

Protect this route with admin-only access check.
