import fetch from 'node-fetch';

const testLogin = async () => {
  try {
    console.log('🧪 Testing login API directly...');

    const loginData = {
      email: 'gsaru952@gmail.com',
      password: 'saruG@32'
    };

    console.log('📤 Sending login request...');
    console.log('Email:', loginData.email);
    console.log('Password:', loginData.password);

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    console.log('\n📥 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));

    const data = await response.json();
    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Login successful!');
      console.log('User Role:', data.role);
      console.log('Token received:', data.token ? 'Yes' : 'No');
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLogin();