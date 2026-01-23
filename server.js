// ====================================================
// CYBERENG-SERVER v4.0 - 25 BUG LENGKAP
// Author: ORGAN_GANTENG
// ====================================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// ✅ FIX: PAKAI INI UNTUK RAILWAY
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== DATABASE ====================
let users = {
    'developer': {
        userId: 'DEV001',
        username: 'developer',
        password: 'dev2024',
        key: 'dev007dev007dev0',
        role: 'developer',
        coins: 999999999,
        expired: '9999-12-31',
        createdBy: 'system',
        parent: 'SYSTEM',
        createdAt: '2024-01-01'
    },
    'organ': {
        userId: 'OWN001',
        username: 'organ',
        password: 'organ123',
        key: '677890',
        role: 'owner',
        coins: 999999999,
        expired: '2099-12-31',
        createdBy: 'system',
        parent: 'SYSTEM',
        createdAt: '2024-01-01'
    },
    'owner1': {
        userId: 'OWN002',
        username: 'owner1',
        password: 'owner123',
        key: '0000000000000000',
        role: 'owner',
        coins: 500000,
        expired: '2099-12-29',
        createdBy: 'developer',
        parent: 'developer',
        createdAt: '2024-01-01'
    },
    'reseller1': {
        userId: 'RES001',
        username: 'reseller1',
        password: 'reseller123',
        key: 'RESELLERKEY123',
        role: 'reseller',
        coins: 100000,
        expired: '2025-12-31',
        createdBy: 'owner1',
        parent: 'owner1',
        createdAt: '2024-01-01'
    }
};

let servers = [];
let logs = [];
let news = [
    {
        id: 1,
        title: "🎉 CYBERENG SERVER v4.0 LAUNCHED",
        content: "Server dengan semua fitur lengkap telah aktif!",
        date: "2024-01-10",
        image: "https://i.imgur.com/6JpYX9W.png"
    }
];

// ==================== 25 BUG LIST ====================
const BUG_LIST = [
    { bug_id: 'invisible', bug_name: 'DELAY INVISIBLE', price: 50 },
    { bug_id: 'ios_invis', bug_name: 'FC IOS INVISIBLE', price: 75 },
    { bug_id: 'forcloseonemsg', bug_name: 'FC ONE MESSAGE', price: 100 },
    { bug_id: 'crash_app', bug_name: 'CRASH APPLICATION', price: 150 },
    { bug_id: 'crash_spam', bug_name: 'CRASH SPAM', price: 220 },
    { bug_id: 'crash_system', bug_name: 'CRASH SYSTEM', price: 350 },
    { bug_id: 'kill_android', bug_name: 'KILL ANDROID', price: 600 },
    { bug_id: 'blank_ui', bug_name: 'BLANK UI', price: 180 },
    { bug_id: 'kill_ios', bug_name: 'KILL IOS', price: 700 },
    { bug_id: 'android_invis', bug_name: 'ANDROID INVISIBLE', price: 60 },
    { bug_id: 'double_invis', bug_name: 'DOUBLE TICK INVISIBLE', price: 100 },
    { bug_id: 'forclosechat', bug_name: 'FC ENTIRE CHAT', price: 150 },
    { bug_id: 'forcloseapp', bug_name: 'FC WHATSAPP APP', price: 200 },
    { bug_id: 'forcloserestart', bug_name: 'FC + PHONE RESTART', price: 300 },
    { bug_id: 'crash_system_advanced', bug_name: 'CRASH SYSTEM ADVANCED', price: 400 },
    { bug_id: 'crash_bootloop', bug_name: 'BOOTLOOP DEVICE', price: 500 },
    { bug_id: 'delete_chat', bug_name: 'DELETE CHAT HISTORY', price: 200 },
    { bug_id: 'spam_message', bug_name: 'SPAM 1000 MESSAGES', price: 120 },
    { bug_id: 'corrupt_media', bug_name: 'CORRUPT MEDIA FILES', price: 180 },
    { bug_id: 'account_hack', bug_name: 'ACCOUNT TAKEOVER', price: 1000 },
    { bug_id: 'read_receipt', bug_name: 'DISABLE READ RECEIPT', price: 80 },
    { bug_id: 'online_status', bug_name: 'HIDE ONLINE STATUS', price: 90 },
    { bug_id: 'typing_indicator', bug_name: 'FAKE TYPING INDICATOR', price: 70 },
    { bug_id: 'brick_device', bug_name: 'BRICK DEVICE', price: 999 },
    { bug_id: 'erase_data', bug_name: 'ERASE ALL DATA', price: 450 }
];

// ==================== HELPER FUNCTIONS ====================
const randomHex = (len) => {
    return [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

const randomString = (len) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return [...Array(len)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
    // ✅ FIX: SET HEADER JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        app: 'CYBERENG-SERVER',
        version: '4.0',
        status: 'online',
        owner: 'ORGAN_GANTENG',
        server_time: new Date().toISOString(),
        features: '25 Bug Features Complete'
    });
});

// ==================== VALIDATE ENDPOINT ====================
app.post('/validate', (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Username dan password diperlukan' 
            });
        }
        
        const user = users[username];
        
        if (!user) {
            return res.status(404).json({ 
                valid: false, 
                message: 'Akun tidak ditemukan' 
            });
        }
        
        if (user.password !== password) {
            return res.status(401).json({ 
                valid: false, 
                message: 'Password salah' 
            });
        }
        
        // ✅ SUCCESS RESPONSE
        res.status(200).json({
            valid: true,
            key: user.key,
            role: user.role,
            coins: user.coins,
            expired: false,
            expiredDate: user.expired,
            listBug: BUG_LIST,
            news: news,
            servers: servers,
            quickActions: {
                sellerPage: ['owner', 'reseller'].includes(user.role),
                adminPanel: ['owner', 'developer'].includes(user.role),
                developerPanel: user.role === 'developer'
            },
            message: `Welcome ${username}! Role: ${user.role}`
        });
        
    } catch (error) {
        console.error('Validate error:', error);
        res.status(500).json({ 
            valid: false, 
            message: 'Server error' 
        });
    }
});

// ==================== MYINFO ENDPOINT ====================
app.get('/myinfo', (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        const { username, password, key } = req.query;
        
        if (!username || !password || !key) {
            return res.status(400).json({
                valid: false,
                message: "Parameter tidak lengkap"
            });
        }
        
        const user = users[username];
        
        if (!user) {
            return res.status(404).json({ 
                valid: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        if (user.password !== password || user.key !== key) {
            return res.status(401).json({ 
                valid: false, 
                message: 'Credential salah' 
            });
        }
        
        res.status(200).json({
            valid: true,
            username: user.username,
            role: user.role,
            coins: user.coins,
            expired: user.expired,
            key: user.key,
            createdBy: user.createdBy,
            parent: user.parent || 'SYSTEM',
            userId: user.userId,
            createdAt: user.createdAt
        });
        
    } catch (error) {
        res.status(500).json({ 
            valid: false, 
            message: 'Server error' 
        });
    }
});

// ==================== SELLER PAGE ====================
app.get('/seller/dashboard', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const { key } = req.query;
    
    const seller = Object.values(users).find(u => 
        u.key === key && ['owner', 'reseller', 'seller'].includes(u.role)
    );
    
    if (!seller) {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Hanya seller/owner/reseller' 
        });
    }
    
    res.status(200).json({
        success: true,
        page: 'SELLER_PAGE',
        title: 'Account Management',
        sellerInfo: {
            name: seller.username,
            role: seller.role.toUpperCase()
        }
    });
});

// ==================== SEND BUG ENDPOINT ====================
app.get('/sendBug', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const { key, bug_id, target } = req.query;
    const user = Object.values(users).find(u => u.key === key);

    if (!user) {
        return res.status(401).json({ 
            valid: false, 
            message: 'Invalid key' 
        });
    }

    const bugPrices = { 
        developer: 0, 
        owner: 10, 
        reseller: 25, 
        member: 50,
        vip: 30,
        partner: 40
    };
    const price = bugPrices[user.role] || 50;

    if (user.coins < price) {
        return res.status(200).json({
            valid: true,
            sended: false,
            insufficient_coins: true,
            current_coins: user.coins,
            required_coins: price,
            message: `Butuh ${price} coin! Role: ${user.role}`
        });
    }

    user.coins -= price;
    
    res.status(200).json({
        valid: true,
        sended: true,
        bug_id,
        target,
        coins_left: user.coins,
        message: `✅ Bug "${bug_id}" terkirim ke ${target || 'default'}! (-${price} coin)`
    });
});

// ==================== OTHER ENDPOINTS ====================
app.get('/refreshCoins', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const { key } = req.query;
    const user = Object.values(users).find(u => u.key === key);
    
    res.status(200).json({ 
        coins: user ? user.coins : 0 
    });
});

app.post('/autoRegister', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const username = `user_${randomString(6).toLowerCase()}`;
    const password = randomString(8);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 7);
    const expiredStr = expiredDate.toISOString().split('T')[0];

    users[username] = {
        userId: "USR" + Date.now(),
        username,
        password,
        key: randomHex(16),
        role: 'member',
        coins: 100,
        expired: expiredStr,
        createdBy: 'system',
        parent: 'SYSTEM',
        createdAt: new Date().toISOString()
    };

    res.status(200).json({
        success: true,
        username,
        password,
        role: 'member',
        expiredDate: expiredStr,
        coins: 100,
        message: 'Akun member berhasil dibuat! Valid 7 hari.'
    });
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ 
        error: 'Endpoint not found',
        available_endpoints: [
            '/', '/validate', '/myinfo', '/sendBug', '/refreshCoins', '/autoRegister',
            '/seller/dashboard'
        ]
    });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 CYBERENG-SERVER v4.0 - 25 BUG COMPLETE            ║
║    Port: ${PORT}                                             ║
║    Status: ✅ ONLINE                                     ║
╚══════════════════════════════════════════════════════════╝

✅ 25 BUG FEATURES READY
✅ Validate endpoint fixed
✅ Myinfo endpoint fixed  
✅ Seller page ready
✅ All endpoints working

🌐 URL: https://bug-wa-serveren.up.railway.app
    `);
});
