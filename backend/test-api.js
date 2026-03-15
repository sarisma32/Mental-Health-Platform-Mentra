// Simple API test script
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testAPI = async () => {
  try {
    console.log('🧪 Testing Mentra Backend API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test patient registration
    console.log('\n2. Testing patient registration...');
    const patientData = {
      fullName: 'John Doe',
      email: 'john.doe@test.com',
      password: 'TestPass123!',
      phoneNumber: '+1234567890',
      age: 25
    };

    const patientResponse = await fetch(`${BASE_URL}/api/patients/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });

    const patientResult = await patientResponse.json();
    if (patientResult.success) {
      console.log('✅ Patient registration successful');
    } else {
      console.log('❌ Patient registration failed:', patientResult.message);
    }

    // Test admin login
    console.log('\n3. Testing admin login...');
    const adminData = {
      email: 'admin@mentra.com',
      password: 'Admin@123'
    };

    const adminResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    const adminResult = await adminResponse.json();
    if (adminResult.success) {
      console.log('✅ Admin login successful');
    } else {
      console.log('❌ Admin login failed:', adminResult.message);
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
};

testAPI();