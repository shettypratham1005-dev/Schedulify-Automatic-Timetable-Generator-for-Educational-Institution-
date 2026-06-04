const axios = require('axios');

async function debugGenerate() {
  try {
    const response = await axios.post('http://localhost:5000/api/timetables/auto-generate', {
      className: 'BE',
      semester: 8
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Note: auth is bypassed here if we don't have a token, 
        // but let's assume the local server can take a request or we find one.
        // Wait, I should probably check if I can bypass auth or just use Login.
      }
    });
    console.log('Success:', response.data);
  } catch (err) {
    if (err.response) {
      console.log('Error Status:', err.response.status);
      console.log('Error Data:', err.response.data);
    } else {
      console.log('Error Message:', err.message);
    }
  }
}

debugGenerate();
