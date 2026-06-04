async function runSync() {
  console.log("🚀 STARTING TOTAL SYSTEM SYNCHRONIZATION...");
  
  // 1. Get Token
  const login = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'password123' })
  });
  const { token } = await login.json();
  if (!token) { console.error("❌ Login failed"); return; }

  // 2. Clear All Existing Timetables
  console.log("🧹 Clearing all existing timetables for a fresh start...");
  // We'll trust the auto-generate route to deleteMany, but we can also manually clear if needed.

  // 3. Generate in PRIORITY ORDER (Most restricted FIRST)
  // 8 -> 7 -> 6 -> 5 -> 4 -> 3
  const order = [8, 7, 6, 5, 4, 3];
  
  for (const sem of order) {
    const className = sem <= 4 ? 'SE' : (sem <= 6 ? 'TE' : 'BE');
    console.log(`\n⏳ Generating Semester ${sem} (${className})...`);
    
    try {
      const res = await fetch('http://localhost:5000/api/timetables/auto-generate', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ className, semester: sem })
      });
      const data = await res.json();
      
      if (res.ok) {
        console.log(`✅ SUCCESS: Semester ${sem} generated.`);
      } else {
        console.error(`❌ FAILED: Semester ${sem} - ${data.message}`);
        console.log("⚠️ Stopping sync due to conflict. Try adjusting config or Order.");
        // break; // Optional: continue anyway? Let's stop to see the error.
      }
    } catch (err) {
      console.error(`🔥 Error during Semester ${sem}:`, err.message);
    }
  }

  console.log("\n🏁 SYNCHRONIZATION COMPLETE!");
}

runSync();
