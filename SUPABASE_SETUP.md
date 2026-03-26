# Supabase Authentication Setup Guide

## ✅ Implementation Complete

Your Supabase authentication system has been fully configured with email verification. Here are the complete setup and implementation instructions.

## 📋 Prerequisites

- Supabase project created at https://supabase.com
- Supabase URL and Anon Key obtained

## 🚀 Complete Setup Steps

### **Step 1: Install Dependencies** ✓ Complete
```bash
npm install @supabase/supabase-js
```

### **Step 2: Environment Variables** ⚙️
Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**To get these credentials:**
1. Go to Supabase Dashboard
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon (public) key** → `VITE_SUPABASE_ANON_KEY`

### **Step 3: Configure Email Provider** 📧
By default, Supabase uses an email-only auth method. To enable email verification:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email**
4. Go to **Email Templates** and verify:
   - **Confirm signup** template is enabled
   - It contains a link with `{{ confirmation_url }}`

### **Step 4: Set Email Redirect URL** 🔗
1. Go to **Authentication** → **URL Configuration**
2. Add your redirect URL:
   ```
   http://localhost:5173/verify-email
   ```
3. For production, add:
   ```
   https://yourdomain.com/verify-email
   ```

### **Step 5: Configure SMTP (Optional but Recommended)** 📬
By default, Supabase uses limited test emails. For production:

1. Go to **Email** settings in your Supabase project
2. Configure your email service (SendGrid, Resend, etc.)
3. Or use Supabase's built-in SMTP:
   - Go to **Settings** → **Email**
   - Enable SMTP and provide credentials

## 📁 Files Created/Updated

### New Files:
- `src/lib/supabase.ts` - Supabase client initialization
- `src/pages/VerifyEmail.tsx` - Email verification page
- `.env.local` - Environment variables

### Updated Files:
- `src/context/AuthContext.tsx` - Supabase integration with email verification
- `src/pages/Login.tsx` - Updated for Supabase auth
- `src/pages/Register.tsx` - Updated for Supabase auth (signup + email verification)
- `src/App.tsx` - Added `/verify-email` route

## 🔐 Authentication Flow

### **Registration Flow:**
1. User fills registration form with email, password, and profile details
2. User clicks "Create Account"
3. Supabase sends verification email to the provided email address
4. User clicks verification link in email
5. Email verified, user can now login
6. Redirect to dashboard after login

### **Login Flow:**
1. User enters email and password
2. System verifies with Supabase
3. Session created
4. Redirected to dashboard

### **Email Verification:**
- Verification link sent immediately after signup
- Link valid for 24 hours (configurable)
- Unverified users cannot login
- Resend email option available on verify page

## 🧪 Testing Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/register`

3. Fill in the registration form:
   - Name: Your Name
   - Email: test@example.com
   - Password: at least 6 characters
   - Branch: CSE (example)
   - Graduation Year: 2026
   - CGPA: 8.5

4. Submit the form

5. **For local testing without email:**
   - Go to Supabase Dashboard
   - **Authentication** → **Users**
   - See the newly created user (unverified)
   - You can manually verify or use test email service

### **Email Testing Services:**
For development, use:
- **Mailtrap** - Free email testing
- **MailHog** - Local SMTP server
- **Inbucket** - Local email service

## 🔄 API Reference

### AuthContext Hooks:

```typescript
const { 
  user,           // Current user object
  isAuthenticated, // Boolean
  login,          // (email, password) => Promise<void>
  logout,         // () => Promise<void>
  signup,         // (email, password, name) => Promise<void>
  isLoading,      // Boolean
  error,          // String | null
  clearError      // () => void
} = useAuth();
```

### User Object:
```typescript
{
  id: string;           // User ID from Supabase
  email: string;        // User email
  name?: string;        // User name
  emailVerified: boolean; // Email verification status
  createdAt?: string;   // Account creation date
}
```

## 🛡️ Security Features Implemented

- ✅ Password hashing (Supabase handles)
- ✅ JWT token management
- ✅ Automatic session recovery
- ✅ Email verification required
- ✅ Protected routes with ProtectedRoute component
- ✅ Real-time auth state synchronization
- ✅ Error handling and validation

## 🔄 Session Management

Sessions are managed automatically:
- JWTs stored in browser (secure)
- Auto-refresh on token expiry
- Logout clears session
- Real-time auth state changes via `onAuthStateChange`

## 📧 Email Verification Flow

1. **Sign Up** → Email sent immediately
2. **Verify Email** → User clicks link in email
3. **Email Confirmed** → Supabase marks as verified
4. **Login Available** → User can now login
5. **Auto Redirect** → User sent to dashboard

## 🚨 Common Issues & Solutions

### Issue: "Missing Supabase URL or Anon Key"
**Solution:** Check `.env.local` file has correct values

### Issue: Email not received
**Solution:**
- Check spam folder
- Verify email provider configured
- Check email templates in Supabase

### Issue: "Invalid login credentials"
**Solution:**
- Verify email is verified first
- Check password is correct
- Ensure user account exists in Supabase

### Issue: Redirect URL mismatch
**Solution:**
- Add `http://localhost:5173/verify-email` to Supabase URL Configuration
- Add production URL when deployed

## 📱 Protected Routes

Protected routes auto-redirect unauth users to `/login`:
- `/home`
- `/dashboard`
- `/companies`
- `/eligibility`
- `/experiences`
- `/post-experience`

## 🚀 Next Steps

1. **Configure Email Service:**
   - Set up SMTP in Supabase
   - Or use SendGrid/Resend integration

2. **Test Complex Flows:**
   - Password reset
   - Email change
   - Session recovery

3. **Customize Email Templates:**
   - Go to Auth Templates in Supabase
   - Edit confirmation email

4. **Add Additional Features:**
   - Social login (Google, GitHub)
   - Two-factor authentication
   - Profile management

5. **Deploy to Production:**
   - Update `.env.local` with production URLs
   - Test all flows in production
   - Monitor auth logs in Supabase

## 📚 Useful Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Email Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [URL Configuration](https://supabase.com/docs/guides/auth/managing-user-data)

## 💡 Pro Tips

1. **Test Email Verification Locally:**
   Use `supabase.auth.confirmOtp()` in console with OTP from email

2. **Monitor Logs:**
   Check Supabase Dashboard → Auth → Logs for debugging

3. **Session Persistence:**
   Sessions automatically persist across page reloads

4. **Custom Claims:**
   Store extra user info in `user_metadata` during signup

## ✨ All Set!

Your Supabase authentication system is now live and ready to use. Start by testing the registration and email verification flows.

**Questions?** Refer to the Supabase documentation or check the implementation in:
- `src/context/AuthContext.tsx`
- `src/lib/supabase.ts`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/VerifyEmail.tsx`
