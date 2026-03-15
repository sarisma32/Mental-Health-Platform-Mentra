import fetch from 'node-fetch';

async function finalTest() {
  console.log('🧪 FINAL TEST - Forgot Password with Email');
  console.log('==========================================');
  console.log('Backend: http://localhost:5002');
  console.log('Testing email: sarismaghimire32@gmail.com');
  console.log('');
  
  try {
    const response = await fetch('http://localhost:5002/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'sarismaghimire32@gmail.com' }),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    console.log('');
    
    if (data.success) {
      console.log('✅ SUCCESS! Check your email inbox now!');
      console.log('📧 Email: sarismaghimire32@gmail.com');
      console.log('📬 Subject: Password Reset OTP - Mentra');
      console.log('');
      console.log('The OTP should arrive within seconds.');
    } else {
      console.log('❌ FAILED:', data.message);
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

finalTest();