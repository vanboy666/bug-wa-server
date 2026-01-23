// ====================================================
// CYBERENG-SERVER - ULTIMATE FIX
// ====================================================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// ✅ FIX 1: DISABLE SEMUA MIDDLEWARE DULU
// app.use(express.json());  // COMMENT DULU
// app.use(express.urlencoded({ extended: true })); // COMMENT DULU

// ✅ FIX 2: PAKAI MANUAL BODY PARSER
app.use((req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        try {
            if (data) req.body = JSON.parse(data);
            else req.body = {};
        } catch (e) {
            req.body = {};
        }
        next();
    });
});

// ✅ FIX 3: TAMBAH CORS HEADER
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// DATABASE
const users = {
    'organ': { username: 'organ', password: 'organ123', key: '677890', role: 'owner', coins: 999999999 }
};

// ✅ FIX 4: ROOT ENDPOINT SANGAT SIMPLE
app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        status: 'online', 
        message: 'Server is running',
        time: new Date().toISOString() 
    }));
});

// ✅ FIX 5: VALIDATE ENDPOINT SANGAT SIMPLE
app.post('/validate', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    try {
        const body = req.body || {};
        const { username, password } = body;
        
        if (username === 'organ' && password === 'organ123') {
            return res.end(JSON.stringify({
                valid: true,
                key: '677890',
                role: 'owner',
                coins: 999999999,
                message: 'Login successful'
            }));
        }
        
        res.end(JSON.stringify({
            valid: false,
            message: 'Invalid credentials'
        }));
        
    } catch (error) {
        res.end(JSON.stringify({
            valid: false,
            message: 'Server error'
        }));
    }
});

// ✅ FIX 6: MYINFO ENDPOINT
app.get('/myinfo', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    const { username, password, key } = req.query;
    
    if (username === 'organ' && password === 'organ123' && key === '677890') {
        return res.end(JSON.stringify({
            valid: true,
            username: 'organ',
            role: 'owner',
            coins: 999999999
        }));
    }
    
    res.end(JSON.stringify({
        valid: false,
        message: 'Invalid credentials'
    }));
});

// ✅ FIX 7: HEALTH CHECK
app.get('/health', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime() }));
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
✅ SERVER STARTED - NO MIDDLEWARE CONFLICT
📍 Port: ${PORT}
🌐 Test URL: https://bug-wa-serveren.up.railway.app/health
    `);
});
