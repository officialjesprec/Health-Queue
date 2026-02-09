# Hospital ID Email Feature

## Overview
After successful hospital registration, the system automatically sends an email to the admin with their Hospital ID and instructions.

## What Happens on Registration

1. **Instant Browser Alert**: 
   - Shows Hospital ID
   - Provides copy-to-clipboard option
   - Gives 5 seconds to copy before redirect

2. **Email Notification** (requires setup):
   - Beautiful HTML email
   - Contains Hospital ID
   - Includes access instructions
   - Provides dashboard link

## Current Implementation

### ✅ What's Working Now:
- **Browser Alert with Copy**: After registration, a confirmation dialog shows the Hospital ID with option to copy to clipboard
- **Console Logging**: Hospital ID is logged for development/debugging
- **5-Second Delay**: Gives admin time to see and copy ID before redirect
- **Success Toast**: Clear success message

### ⏳ What Needs Setup (Email Sending):

The email sending feature is ready but requires:

1. **Email Service API Key**
   - Currently configured for Resend (https://resend.com)
   - Alternatives: SendGrid, Mailgun, AWS SES

2. **Supabase Edge Function Deployment**
   ```bash
   # Deploy the email function
   supabase functions deploy send-hospital-id-email --no-verify-jwt
   
   # Set the API key secret
   supabase secrets set RESEND_API_KEY=your_api_key_here
   ```

3. **Update Frontend to Call Function**
   - Uncomment the email function call in `HospitalRegistration.tsx`
   - Add error handling

## How to Enable Email Sending

### Step 1: Choose Email Service

**Option A: Resend (Recommended)**
- Free tier: 100 emails/day
- Sign up: https://resend.com
- Get API key from dashboard

**Option B: SendGrid**
- Free tier: 100 emails/day
- Sign up: https://sendgrid.com

**Option C: Custom SMTP**
- Use your own email server

### Step 2: Deploy Edge Function

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy function
cd supabase/functions
supabase functions deploy send-hospital-id-email --no-verify-jwt

# Set API key
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Step 3: Update Frontend

In `src/pages/HospitalRegistration.tsx`, after successful hospital creation:

```typescript
// Call the email function
try {
  await supabase.functions.invoke('send-hospital-id-email', {
    body: {
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      email: form.email,
      adminName: form.contactPerson || 'Admin'
    }
  });
  console.log('✅ Hospital ID email sent');
} catch (emailError) {
  console.error('⚠️ Email failed (but registration succeeded):', emailError);
  // Don't fail the registration if email fails
}
```

## Email Template

The email includes:
- 🎉 Welcome header with hospital name
- 📋 Hospital ID in a prominent box
- ⚠️ Important instructions on what to do with the ID
- 🚀 Next steps for getting started
- 🔗 Direct link to hospital dashboard

## Testing Without Email Service

For development, the current implementation:
1. Shows browser alert with Hospital ID ✅
2. Provides copy-to-clipboard functionality ✅
3. Logs to console for debugging ✅
4. Stores ID in database ✅

Users can still:
- Copy the ID from the browser alert
- Access it from the database
- Find it in console logs (during development)

## Security Notes

1. **Hospital ID is NOT secret**: It's used for routing, not authentication
2. **Authentication Required**: Staff still need valid credentials to log in
3. **Email is sent unencrypted**: Don't include passwords in email
4. **Rate Limiting**: Email service may have rate limits

## Troubleshooting

### Issue: Email not received

1. Check spam folder
2. Verify email address is correct
3. Check Supabase function logs:
   ```bash
   supabase functions logs send-hospital-id-email
   ```
4. Verify API key is set:
   ```bash
   supabase secrets list
   ```

### Issue: Function deployment fails

1. Ensure Supabase CLI is latest version:
   ```bash
   npm install -g supabase
   ```
2. Check you're linked to correct project:
   ```bash
   supabase status
   ```
3. Verify function syntax:
   ```bash
   deno check supabase/functions/send-hospital-id-email/index.ts
   ```

## Future Enhancements

- [ ] Email templates for staff invitations
- [ ] Resend Hospital ID feature (forgot ID)
- [ ] SMS notification as backup
- [ ] QR code with Hospital ID
- [ ] Admin dashboard showing email delivery status
