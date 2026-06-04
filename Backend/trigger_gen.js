const http = require('http');

const loginData = JSON.stringify({
    email: "pratham@example.com",
    password: "123456"
});

const loginOptions = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

const req = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const loginRes = JSON.parse(data);
            const token = loginRes.token;
            if (!token) {
                console.error("❌ Login failed:", loginRes);
                return;
            }
            console.log("✅ Logged in. Token received.");

            const genOptions = {
                hostname: '127.0.0.1',
                port: 5000,
                path: '/api/timetables/auto-generate-even',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const genReq = http.request(genOptions, (genRes) => {
                let genData = '';
                genRes.on('data', (chunk) => { genData += chunk; });
                genRes.on('end', () => {
                    console.log("✅ Generation Response:", genData);
                });
            });
            genReq.on('error', (err) => console.error("🔥 Gen Error:", err.message));
            genReq.end();
        } catch (e) {
            console.error("🔥 Parser Error:", e.message, data);
        }
    });
});

req.on('error', (error) => {
    console.error("🔥 Login Error:", error.message);
});

req.write(loginData);
req.end();
