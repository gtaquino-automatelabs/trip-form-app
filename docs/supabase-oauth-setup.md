# Supabase OAuth and Storage Setup Guide

This guide provides step-by-step instructions for configuring OAuth providers and storage permissions for the trip-form-app Supabase Cloud project.

## Table of Contents
- [Authentication Configuration](#authentication-configuration)
  - [Email/Password Authentication](#emailpassword-authentication)
  - [Google OAuth Setup](#google-oauth-setup)
  - [Microsoft OAuth Setup](#microsoft-oauth-setup)
- [Storage Configuration](#storage-configuration)
  - [Storage Bucket Status](#storage-bucket-status)
  - [Storage RLS Policies Setup](#storage-rls-policies-setup)

---

## Authentication Configuration

### Email/Password Authentication

**Status**: ✅ **ENABLED** (Default)

Email/password authentication is enabled by default in all Supabase projects. Users can:
- Sign up with email and password
- Sign in with email and password
- Reset passwords via email
- Verify email addresses

**Configuration**: No additional setup required.

**Testing**:
```javascript
// Sign up example
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
})
```

---

### Google OAuth Setup

**Status**: ⏳ **PENDING CONFIGURATION**

Google OAuth requires external credentials from Google Cloud Console.

#### Prerequisites
- Active Google Cloud Console account
- Project created in Google Cloud Console

#### Setup Steps

**Step 1: Create OAuth 2.0 Credentials in Google Cloud Console**

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Configure the consent screen if prompted:
   - User Type: External
   - App name: `Trip Form App` (or your app name)
   - Support email: Your email
   - Authorized domains: Your domain
   - Developer contact: Your email

**Step 2: Configure OAuth Client**

1. Application type: **Web application**
2. Name: `Trip Form App - Supabase Auth`
3. Authorized JavaScript origins:
   ```
   https://swsncutfzczgubdzjcpk.supabase.co
   ```
4. Authorized redirect URIs:
   ```
   https://swsncutfzczgubdzjcpk.supabase.co/auth/v1/callback
   ```
5. Click **CREATE**
6. **Save the Client ID and Client Secret** (you'll need these in Step 3)

**Step 3: Configure in Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/swsncutfzczgubdzjcpk/auth/providers)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the provider list
4. Toggle **Enable Sign in with Google**
5. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
6. Click **Save**

**Step 4: Test Integration**

```javascript
// Sign in with Google example
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://your-app-url.com/auth/callback'
  }
})
```

#### Troubleshooting

**Error**: "Redirect URI mismatch"
- **Solution**: Ensure the redirect URI in Google Cloud Console exactly matches:
  `https://swsncutfzczgubdzjcpk.supabase.co/auth/v1/callback`

**Error**: "Access blocked: Authorization Error"
- **Solution**: Add test users to OAuth consent screen or publish the app

**Error**: "Invalid client"
- **Solution**: Verify Client ID and Client Secret are correctly copied from Google Cloud Console

---

### Microsoft OAuth Setup

**Status**: ⏳ **PENDING CONFIGURATION**

Microsoft OAuth requires application registration in Azure Active Directory (Microsoft Entra ID).

#### Prerequisites
- Microsoft Azure account
- Access to Azure Active Directory

#### Setup Steps

**Step 1: Register Application in Azure AD**

1. Navigate to [Azure Portal](https://portal.azure.com/)
2. Go to **Azure Active Directory** (or **Microsoft Entra ID**)
3. Select **App registrations** → **+ New registration**
4. Configure the application:
   - **Name**: `Trip Form App - Supabase Auth`
   - **Supported account types**:
     - *Accounts in any organizational directory and personal Microsoft accounts* (recommended)
     - Or select based on your requirements
   - **Redirect URI**:
     - Platform: **Web**
     - URI: `https://swsncutfzczgubdzjcpk.supabase.co/auth/v1/callback`
5. Click **Register**

**Step 2: Create Client Secret**

1. In your registered app, go to **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `Supabase Auth Secret`
4. Expires: Choose expiration period (recommend 24 months)
5. Click **Add**
6. **Immediately copy the secret Value** (you won't be able to see it again)

**Step 3: Copy Application (Client) ID**

1. In your app's **Overview** page
2. Copy the **Application (client) ID** - you'll need this for Supabase

**Step 4: Configure API Permissions (Optional but Recommended)**

1. Go to **API permissions**
2. Verify **Microsoft Graph** permissions include:
   - `openid` (Sign users in)
   - `email` (View users' email address)
   - `profile` (View users' basic profile)
3. These should be present by default

**Step 5: Configure in Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/swsncutfzczgubdzjcpk/auth/providers)
2. Navigate to **Authentication** → **Providers**
3. Find **Azure** (Microsoft) in the provider list
4. Toggle **Enable Sign in with Azure**
5. Enter your Azure credentials:
   - **Client ID**: Application (client) ID from Azure
   - **Client Secret**: Secret value from Azure
   - **Azure Tenant**: (Optional) Specify if using specific tenant
6. Click **Save**

**Step 6: Test Integration**

```javascript
// Sign in with Microsoft example
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'azure',
  options: {
    scopes: 'email',
    redirectTo: 'https://your-app-url.com/auth/callback'
  }
})
```

#### Troubleshooting

**Error**: "AADSTS50011: The redirect URI specified does not match"
- **Solution**: Verify redirect URI in Azure AD exactly matches:
  `https://swsncutfzczgubdzjcpk.supabase.co/auth/v1/callback`

**Error**: "AADSTS700016: Application not found"
- **Solution**: Double-check Application (client) ID is correctly entered in Supabase

**Error**: "AADSTS7000215: Invalid client secret"
- **Solution**: Generate a new client secret in Azure and update Supabase configuration

**Secret Expired**:
- Client secrets expire based on the expiration period you chose
- Before expiration, create a new secret and update Supabase configuration
- Old secret will continue to work until you remove it from Azure

---

## Storage Configuration

### Storage Bucket Status

**Bucket Name**: `travel-documents`
**Status**: ✅ **CREATED**

**Configuration**:
- **Public**: `false` (Private - requires authentication)
- **File Size Limit**: `10 MB` (10,485,760 bytes)
- **Allowed MIME Types**:
  - `image/jpeg` - JPEG images (e.g., passport photos)
  - `image/png` - PNG images
  - `application/pdf` - PDF documents (e.g., flight suggestions)
  - `application/msword` - Microsoft Word documents (.doc)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Microsoft Word documents (.docx)

**Created**: 2025-10-19

---

### Storage RLS Policies Setup

**Status**: ⚠️ **REQUIRES MANUAL CONFIGURATION**

Storage Row Level Security (RLS) policies must be created through the Supabase Dashboard due to permission requirements.

#### Required Policies

The following 5 policies need to be created for the `travel-documents` bucket:

---

**Policy 1: Users can upload to own folder**
- **Name**: `Users can upload to own folder`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition** (WITH CHECK):
  ```sql
  bucket_id = 'travel-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

**Policy 2: Users can read own files**
- **Name**: `Users can read own files`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition** (USING expression):
  ```sql
  bucket_id = 'travel-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

**Policy 3: Users can update own files**
- **Name**: `Users can update own files`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition** (USING expression):
  ```sql
  bucket_id = 'travel-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

**Policy 4: Users can delete own files**
- **Name**: `Users can delete own files`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition** (USING expression):
  ```sql
  bucket_id = 'travel-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

**Policy 5: Admins can access all files**
- **Name**: `Admins can access all files`
- **Allowed operations**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- **Target roles**: `authenticated`
- **Policy definition** (USING expression):
  ```sql
  bucket_id = 'travel-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  ```

---

#### Setup Instructions via Dashboard

1. Go to [Supabase Dashboard - Storage](https://supabase.com/dashboard/project/swsncutfzczgubdzjcpk/storage/buckets)
2. Click on the **travel-documents** bucket
3. Navigate to the **Policies** tab
4. Click **New Policy**
5. For each policy above:
   - Enter the policy name
   - Select the allowed operation(s)
   - Add the target role: `authenticated`
   - Paste the SQL policy definition into the appropriate field (USING or WITH CHECK)
   - Click **Review** then **Save policy**

#### Folder Structure

Files will be organized by user ID:
```
travel-documents/
├── <user-uuid-1>/
│   ├── passport.jpg
│   └── flight-suggestion.pdf
├── <user-uuid-2>/
│   ├── passport.png
│   └── ticket.pdf
```

Users can only access files in their own folder (`<user-uuid>/...`), while admins can access all folders.

---

## Testing Authentication and Storage

### Test Email/Password Auth
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
})
```

### Test File Upload
```javascript
const { data, error } = await supabase.storage
  .from('travel-documents')
  .upload(`${userId}/passport.jpg`, fileBlob, {
    contentType: 'image/jpeg'
  })
```

### Test File Download
```javascript
const { data, error } = await supabase.storage
  .from('travel-documents')
  .download(`${userId}/passport.jpg`)
```

---

## Configuration Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Email/Password Auth | ✅ Enabled | None - ready to use |
| Google OAuth | ⏳ Pending | Configure in Google Cloud Console and Supabase Dashboard |
| Microsoft OAuth | ⏳ Pending | Configure in Azure AD and Supabase Dashboard |
| Storage Bucket | ✅ Created | None - bucket operational |
| Storage RLS Policies | ⚠️ Manual Setup | Create 5 policies via Supabase Dashboard |

---

## Next Steps

1. **For Google OAuth**: Follow Google OAuth Setup section to obtain credentials
2. **For Microsoft OAuth**: Follow Microsoft OAuth Setup section to register application
3. **For Storage Policies**: Follow Storage RLS Policies Setup via Dashboard
4. **Test Integration**: Use the testing examples after configuration

---

## Support Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Microsoft OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-azure)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)

---

**Project**: trip-form-app
**Supabase Project ID**: swsncutfzczgubdzjcpk
**Region**: sa-east-1 (South America - São Paulo)
**Last Updated**: 2025-10-19
