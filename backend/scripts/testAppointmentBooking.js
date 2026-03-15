import fetch from 'node-fetch';

const testBooking = async () => {
  try {
    const appointmentData = {
      patientId: 1, // Assuming patient ID 1 exists
      doctorId: 5,
      appointmentDate: '2026-01-15',
      appointmentTime: '09:00',
      appointmentType: 'initial',
      sessionFee: 2500,
      durationMinutes: 60,
      
      // Patient information
      patientFirstName: 'John',
      patientLastName: 'Doe',
      patientEmail: 'john.doe@example.com',
      patientPhone: '+977-9841234567',
      patientDateOfBirth: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      
      // Session details
      reasonForVisit: 'Anxiety and stress management',
      previousTherapy: null,
      currentMedications: null,
      specialRequests: null,
      
      // Professional information
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'Clinical Psychology',
      doctorLocation: 'Tribhuvan University Teaching Hospital',
      doctorAddress: 'Maharajgunj, Kathmandu, Nepal',
      doctorPhone: '(01) 4412303'
    };

    console.log('🔄 Testing appointment booking...');
    console.log('Data being sent:', JSON.stringify(appointmentData, null, 2));

    const response = await fetch('http://localhost:5000/api/appointments/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();
    
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Appointment booking successful!');
    } else {
      console.log('❌ Appointment booking failed');
      if (result.errors) {
        console.log('Validation errors:');
        result.errors.forEach(error => {
          console.log(`  - ${error.path}: ${error.msg}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error testing appointment booking:', error);
  }
};

testBooking();