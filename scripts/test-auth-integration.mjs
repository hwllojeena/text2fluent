import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('--- Starting Auth Integration Tests ---');
  
  const uniqueId = Date.now();
  const testEmail = `test.auth.${uniqueId}@gmail.com`;
  const testPassword = 'TestPassword123!';

  console.log(`\n[1] Registering a new user: ${testEmail}`);
  try {
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
    } else if (registerData.error && registerData.error.includes('duplicate')) {
      console.log('⚠️ Warning: Duplicate user (expected if rerunning). Ignoring.');
    } else {
      console.log('❌ Registration failed:', registerData);
      throw new Error('Registration failed');
    }
  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED') {
       console.error('❌ Could not connect to the local server. Is it running?');
       process.exit(1);
    }
  }

  console.log('\n[2] Fetching NextAuth CSRF Token');
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const cookies = csrfRes.headers.get('set-cookie') || '';
  
  if (!csrfData.csrfToken) {
    console.error('❌ Failed to extract CSRF token:', csrfData);
    process.exit(1);
  }
  console.log('✅ CSRF Token retrieved.');

  console.log(`\n[3] Testing Credentials Sign-In (Success Case)`);
  const signinBody = new URLSearchParams({
    csrfToken: csrfData.csrfToken,
    email: testEmail,
    password: testPassword,
    redirect: 'false',
    json: 'true',
  });

  const signinReq = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies,
    },
    body: signinBody.toString(),
  });

  const signinData = await signinReq.json();
  if (signinReq.ok && signinData.url && !signinData.error) {
    console.log('✅ Sign in successful. NextAuth returned:', signinData);
  } else {
    console.error('❌ Sign in failed:', signinData);
    process.exit(1);
  }

  console.log(`\n[4] Testing Credentials Sign-In (Failure Case)`);
  const badSigninBody = new URLSearchParams({
    csrfToken: csrfData.csrfToken,
    email: testEmail,
    password: 'WrongPassword!!!',
    redirect: 'false',
    json: 'true',
  });

  const badSigninReq = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies,
    },
    body: badSigninBody.toString(),
  });

  const badSigninData = await badSigninReq.json();
  if (badSigninData.error) {
    console.log('✅ Invalid login rejected correctly. NextAuth returned:', badSigninData);
  } else {
    console.error('❌ Invalid login unexpectedly succeeded:', badSigninData);
    process.exit(1);
  }

  console.log('\n--- 🎉 All Auth Tests Passed ---');
}

testAuth().catch(e => {
  console.error('Test script crashed:', e);
  process.exit(1);
});
