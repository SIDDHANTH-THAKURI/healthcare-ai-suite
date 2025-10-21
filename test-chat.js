// Quick test script to diagnose chat endpoint issue
const axios = require('axios');

async function testChat() {
  try {
    console.log('Testing chat endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/chat/message', {
      patientId: 'test-patient-001',
      content: 'Hello, how are you?'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

testChat();
