import fetch from 'node-fetch';

async function testPatientsAPI() {
  try {
    console.log('Testing /api/admin/patients endpoint...');
    const response = await fetch('http://localhost:5002/api/admin/patients');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.patients) {
      console.log(`\n✅ Found ${data.patients.length} patients`);
      console.table(data.patients.map(p => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        status: p.status
      })));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPatientsAPI();
