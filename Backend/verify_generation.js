async function test(sem, token) {
  try {
    const res = await fetch('http://localhost:5000/api/timetables/auto-generate', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        className: sem <= 4 ? 'SE' : (sem <= 6 ? 'TE' : 'BE'),
        semester: sem
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Semester ${sem} Success:`, data.message);
    } else {
      console.error(`❌ Semester ${sem} Failed:`, data.message);
    }
  } catch (err) {
    console.error(`❌ Semester ${sem} error:`, err.message);
  }
}

async function getAuth() {
  const login = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'password123' })
  });
  const authData = await login.json();
  const token = authData.token;
  
  if (!token) {
    console.error("No token found. Login failed.");
    process.exit(1);
  }

  await test(3, token);
  await test(5, token);
  await test(7, token);
  await test(8, token);
}

getAuth();
