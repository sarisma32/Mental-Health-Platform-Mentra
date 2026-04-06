import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test complete forgot password flow with real user
const testCompleteFlow = async () => {
  console.log(' Testing Complete Forgot Password Flow with Real User...\n');

  const testUser = {
    fullName: 'Test User',
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    phoneNumber: '+1234567890',
    age: 25
  };

  try {
    // Step 1: Register a test user
    console.log(' Registering test user...');
    const registerResponse = await fetch(`${API_BASE}/patients/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();
    console.log('Registration Response:', registerData.success ? 'Success' : registerData.message);

    if (!registerData.success && !registerData.message.includes('already exists')) {
      console.log(' User registration failed');
      return;
    }

    // Step 2: Request OTP for forgot password
    console.log('\n Requesting OTP for forgot password...');
    const forgotResponse = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email
      })
    });

    const forgotData = await forgotResponse.json();
    console.log('Forgot Password Response:', forgotData);

    if (!forgotData.success) {
      console.log(' Forgot password request failed');
      return;
    }

    console.log(' OTP sent! Check the backend console for the OTP.');
    console.log(' In production, this would be sent via email service.');

    // For demo purposes, let's simulate getting the OTP from console
    // In a real test, you'd need to extract the OTP from the console output
    console.log('\n Simulating OTP verification...');
    console.log('  Note: In this demo, you would need to:');
    console.log('   1. Check the backend server console for the OTP');
    console.log('   2. Use that OTP in the verify-otp endpoint');
    console.log('   3. Get the reset token from the response');
    console.log('   4. Use the reset token to reset the password');

    // Example of what the flow would look like:
    console.log('\n Complete Flow Example:');
    console.log('POST /api/auth/forgot-password');
    console.log('   { "email": "testuser@example.com" }');
    console.log('   { "success": true, "message": "OTP sent..." }');
    console.log('');
    console.log('POST /api/auth/verify-otp');
    console.log('   { "email": "testuser@example.com", "otp": "123456" }');
    console.log('   { "success": true, "resetToken": "jwt-token..." }');
    console.log('');
    console.log('POST /api/auth/reset-password');
    console.log('   { "resetToken": "jwt-token...", "newPassword": "NewPass123!", "confirmPassword": "NewPass123!" }');
    console.log('   { "success": true, "message": "Password reset successfully" }');

    console.log('\n Test setup completed! User is ready for forgot password flow.');

  } catch (error) {
    console.error(' Test failed:', error.message);
  }
};

// Run the test
testCompleteFlow();