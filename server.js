// ============================================
// SERVER UNTUK APK BUG WA - SIMPLE FORMAT
// ============================================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware sederhana
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== DATABASE SEDERHANA ==========
const users = {
    'organ': {
        user: 'organ',
        pass: 'organ123',  // APK biasanya pake 'pass' bukan 'password'
        key: '677890',
        role: 'owner',
        coins: 999999999
    }
};

// ========== ENDPOINT APK ==========

// 1. ROOT ENDPOINT (Harus return JSON simple)
app.get('/', (req, res) => {
    res.json({ 
        status: 1,  // APK expect 1 untuk success
        message: 'online',
        server: 'cybereng'
    });
});

// 2. VALIDATE ENDPOINT (Format khusus APK)
app.post('/validate', (req, res) => {
    console.log('APK Validate Request:', req.body);
    
    // APK biasanya kirim: { "user": "organ", "pass": "organ123" }
    const username = req.body.user || req.body.username;
    const password = req.body.pass || req.body.password;
    
    if (!username || !password) {
        return res.json({
            valid: 0,  // APK expect 0 untuk false
            message: 'user and pass required'
        });
    }
    
    const user = users[username];
    
    if (!user || user.pass !== password) {
        return res.json({
            valid: 0,
            message: 'invalid credentials'
        });
    }
    
    // RESPONSE UNTUK APK (format khusus)
    res.json({
        valid: 1,  // 1 untuk true
        key: user.key,
        role: user.role,
        coins: user.coins,
        expired: 0,  // 0 untuk tidak expired
        message: 'login success'
    });
});

// 3. MYINFO ENDPOINT
app.get('/myinfo', (req, res) => {
    const username = req.query.user || req.query.username;
    const password = req.query.pass || req.query.password;
    const key = req.query.key;
    
    if (!username || !password || !key) {
        return res.json({
            valid: 0,
            message: 'parameters missing'
        });
    }
    
    const user = users[username];
    
    if (!user || user.pass !== password || user.key !== key) {
        return res.json({
            valid: 0,
            message: 'invalid'
        });
    }
    
    res.json({
        valid: 1,
        user: user.user,
        role: user.role,
        coins: user.coins,
        key: user.key
    });
});

// 4. HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({ status: 1, uptime: process.uptime() });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
✅ APK SERVER READY
📍 Port: ${PORT}
🌐 URL: https://bug-wa-serveren.up.railway.app

📱 APK TEST:
  User: organ
  Pass: organ123
  Key: 677890
    `);
});
