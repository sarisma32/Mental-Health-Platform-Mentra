import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const testDoctorRegistration = async () => {
  try {
    console.log('🧪 Testing doctor registration endpoint...\n');

    // Create a test PDF file (simulate document upload)
    const testFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF';
    fs.writeFileSync('test-document.pdf', testFileContent);

    const form = new FormData();
    form.append('fullName', 'Dr. Jane Smith');
    form.append('email', 'jane.smith@test.com');
    form.append('password', 'TestPass123!');
    form.append('phoneNumber', '+1234567890');
    form.append('experience', '5 years');
    form.append('licenseNumber', 'LIC123456');
    form.append('hospitalName', 'Test Medical Center');
    form.append('specialization', 'Clinical Psychology');
    form.append('document', fs.createReadStream('test-document.pdf'), {
      filename: 'test-document.pdf',
      contentType: 'application/pdf'
    });

    const response = await fetch('http://localhost:5000/api/doctors/register', {
      method: 'POST',
      body: form
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Doctor registration test successful!');
    } else {
      console.log('❌ Doctor registration test failed:', data.message);
      if (data.errors) {
        console.log('Validation errors:', data.errors);
      }
    }

    // Clean up test file
    fs.unlinkSync('test-document.pdf');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    // Clean up test file if it exists
    try {
      fs.unlinkSync('test-document.pdf');
    } catch (e) {
      // File doesn't exist, ignore
    }
  }
};

testDoctorRegistration();