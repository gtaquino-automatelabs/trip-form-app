// Test OAuth redirect URLs
const googleOAuthUrl = `http://localhost:54321/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback`;
const microsoftOAuthUrl = `http://localhost:54321/auth/v1/authorize?provider=azure&redirect_to=http://localhost:3000/auth/callback`;

console.log('Google OAuth URL:', googleOAuthUrl);
console.log('Microsoft OAuth URL:', microsoftOAuthUrl);

// Test if Supabase Auth is responding
fetch('http://localhost:54321/auth/v1/health')
  .then(res => res.json())
  .then(data => console.log('Supabase Auth Health:', data))
  .catch(err => console.error('Supabase Auth Error:', err.message));