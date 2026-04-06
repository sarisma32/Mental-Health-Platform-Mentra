import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api/auth';

// Test forgot password flow
const testForgotPasswordFlow = async () => {
  console.log(' Testing Forgot Password Flow...\n');

  try {
    // Step 1: Request OTP for forgot password
    console.log(' Testing forgot password request...');
    const forgotResponse = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com' // Use any email - it will show success regardless
      })
    });

    const forgotData = await forgotResponse.json();
    console.log('Forgot Password Response:', forgotData);

    if (forgotData.success) {
      console.log(' Forgot password request successful\n');
    } else {
      console.log(' Forgot password request failed\n');
      return;
    }

    // Step 2: Test OTP verification with invalid OTP
    console.log(' Testing OTP verification with invalid OTP...');
    const invalidOtpResponse = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456' // Invalid OTP
      })
    });

    const invalidOtpData = await invalidOtpResponse.json();
    console.log('Invalid OTP Response:', invalidOtpData);

    if (!invalidOtpData.success) {
      console.log(' Invalid OTP correctly rejected\n');
    } else {
      console.log(' Invalid OTP was accepted (this should not happen)\n');
    }

    // Step 3: Test password reset with invalid token
    console.log(' Testing password reset with invalid token...');
    const resetResponse = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resetToken: 'invalid-token',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      })
    });

    const resetData = await resetResponse.json();
    console.log('Reset Password Response:', resetData);

    if (!resetData.success) {
      console.log(' Invalid reset token correctly rejected\n');
    } else {
      console.log(' Invalid reset token was accepted (this should not happen)\n');
    }

    console.log(' Forgot password flow test completed!');
    console.log('\n Note: To test the complete flow with a real user:');
    console.log('1. Register a user first');
    console.log('2. Use their email for forgot password');
    console.log('3. Check the console for the OTP (mock email service)');
    console.log('4. Use that OTP to verify and get reset token');
    console.log('5. Use the reset token to change password');

  } catch (error) {
    console.error(' Test failed:', error.message);
  }
};

// Run the test
testForgotPasswordFlow();