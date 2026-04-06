// Quick test to verify schedule routes are working
// Run this after restarting the server

const testScheduleRoutes = async () => {
  const baseUrl = 'http://localhost:5002';
  
  console.log(' Testing Schedule Routes...\n');
  
  // Test 1: Get doctor schedule (public route)
  try {
    console.log('Test 1: GET /api/schedules/doctor/11');
    const response = await fetch(`${baseUrl}/api/schedules/doctor/11`);
    const data = await response.json();
    console.log(' Status:', response.status);
    console.log(' Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(' Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Get available slots (public route)
  try {
    console.log('Test 2: GET /api/schedules/doctor/11/available?date=2026-03-15');
    const response = await fetch(`${baseUrl}/api/schedules/doctor/11/available?date=2026-03-15`);
    const data = await response.json();
    console.log(' Status:', response.status);
    console.log(' Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(' Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 3: Health check
  try {
    console.log('Test 3: GET /api/health');
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    console.log(' Status:', response.status);
    console.log(' Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(' Error:', error.message);
  }
  
  console.log('\n Tests complete!');
  console.log('\n Note: If you see "Route not found" errors, restart the backend server:');
  console.log('   1. Stop the current server (Ctrl+C)');
  console.log('   2. Run: node server.js');
};

testScheduleRoutes();
