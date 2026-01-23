// ====================================================
// CYBERENG-SERVER v4.0 - COMPLETE WITH 25 BUGS
// Author: ORGAN_GANTENG
// Railway Ready
// ====================================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ==================== HELPER FUNCTIONS ====================
const randomHex = (len) => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

const randomString = (len) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

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

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
    res.json({
        app: 'CYBERENG-SERVER',
        version: '4.0',
        status: 'online',
        owner: 'ORGAN_GANTENG',
        time: new Date().toISOString(),
        features: '25 Bug Features + Full System'
    });
});

// ==================== VALIDATE ENDPOINT ====================
app.post('/validate', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.json({ 
                valid: false, 
                message: 'Username dan password diperlukan' 
            });
        }
        
        const user = users[username];
        
        if (!user) {
            return res.json({ 
                valid: false, 
                message: 'Akun tidak ditemukan' 
            });
        }
        
        if (user.password !== password) {
            return res.json({ 
                valid: false, 
                message: 'Password salah' 
            });
        }
        
        // SUCCESS RESPONSE
        res.json({
            valid: true,
            key: user.key,
            role: user.role,
            coins: user.coins,
            expired: false,
            expiredDate: user.expired,
            listBug: BUG_LIST,
            servers: servers,
            quickActions: {
                sellerPage: ['owner', 'reseller'].includes(user.role),
                adminPanel: ['owner', 'developer'].includes(user.role),
                developerPanel: user.role === 'developer'
            },
            message: `Welcome ${username}!`
        });
        
    } catch (error) {
        res.json({ 
            valid: false, 
            message: 'Server error' 
        });
    }
});

// ==================== MYINFO ENDPOINT ====================
app.get('/myinfo', (req, res) => {
    try {
        const { username, password, key } = req.query;
        
        if (!username || !password || !key) {
            return res.json({
                valid: false,
                message: "Parameter tidak lengkap"
            });
        }
        
        const user = users[username];
        
        if (!user) {
            return res.json({ 
                valid: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        if (user.password !== password || user.key !== key) {
            return res.json({ 
                valid: false, 
                message: 'Credential salah' 
            });
        }
        
        res.json({
            valid: true,
            username: user.username,
            role: user.role,
            coins: user.coins,
            expired: user.expired,
            key: user.key,
            createdBy: user.createdBy,
            parent: user.parent,
            userId: user.userId
        });
        
    } catch (error) {
        res.json({ 
            valid: false, 
            message: 'Server error' 
        });
    }
});

// ==================== SEND BUG ENDPOINT ====================
app.get('/sendBug', (req, res) => {
    try {
        const { key, bug_id, target } = req.query;
        
        const user = Object.values(users).find(u => u.key === key);
        
        if (!user) {
            return res.json({ 
                valid: false, 
                message: 'Invalid key' 
            });
        }
        
        const bug = BUG_LIST.find(b => b.bug_id === bug_id);
        if (!bug) {
            return res.json({ 
                valid: false, 
                message: 'Bug tidak ditemukan' 
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
            return res.json({
                valid: true,
                sended: false,
                insufficient_coins: true,
                current_coins: user.coins,
                required_coins: price,
                message: `Butuh ${price} coin!`
            });
        }
        
        user.coins -= price;
        
        res.json({
            valid: true,
            sended: true,
            bug_id: bug_id,
            bug_name: bug.bug_name,
            target: target,
            coins_used: price,
            coins_left: user.coins,
            message: `✅ Bug "${bug.bug_name}" terkirim!`
        });
        
    } catch (error) {
        res.json({ 
            valid: false, 
            message: 'Server error' 
        });
    }
});

// ==================== SELLER PAGE ====================
app.get('/seller/dashboard', (req, res) => {
    const { key } = req.query;
    
    const seller = Object.values(users).find(u => 
        u.key === key && ['owner', 'reseller'].includes(u.role)
    );
    
    if (!seller) {
        return res.json({ 
            success: false, 
            message: 'Akses ditolak' 
        });
    }
    
    res.json({
        success: true,
        page: 'SELLER_PAGE',
        title: 'Account Management',
        sellerInfo: {
            name: seller.username,
            role: seller.role.toUpperCase()
        }
    });
});

app.post('/seller/createAccount', (req, res) => {
    try {
        const { seller_key, username, password, duration_days } = req.body;
        
        if (!seller_key || !username || !password || !duration_days) {
            return res.json({
                success: false,
                message: "Semua field wajib diisi"
            });
        }
        
        const seller = Object.values(users).find(u => 
            u.key === seller_key && ['owner', 'reseller'].includes(u.role)
        );
        
        if (!seller) {
            return res.json({
                success: false,
                message: "Seller tidak valid"
            });
        }
        
        if (users[username]) {
            return res.json({
                success: false,
                message: "Username sudah digunakan"
            });
        }
        
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + parseInt(duration_days));
        const expiredStr = expiredDate.toISOString().split('T')[0];
        
        users[username] = {
            userId: "USR" + Date.now(),
            username: username,
            password: password,
            key: randomHex(16),
            role: 'member',
            coins: 0,
            expired: expiredStr,
            createdBy: seller.username,
            parent: seller.username,
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: `✅ Account ${username} created!`,
            details: {
                username: username,
                password: password,
                expired: expiredStr,
                duration: duration_days
            }
        });
        
    } catch (error) {
        res.json({
            success: false,
            message: "Server error"
        });
    }
});

// ==================== ADMIN PANEL ====================
app.get('/admin/dashboard', (req, res) => {
    const { key } = req.query;
    
    const admin = Object.values(users).find(u => 
        u.key === key && ['owner', 'developer'].includes(u.role)
    );
    
    if (!admin) {
        return res.json({ 
            success: false, 
            message: 'Akses ditolak' 
        });
    }
    
    res.json({
        success: true,
        page: 'ADMIN_PANEL',
        title: 'Admin Panel',
        adminInfo: {
            name: admin.username,
            role: admin.role.toUpperCase()
        }
    });
});

// ==================== DEVELOPER ENDPOINTS ====================
app.get('/dev/users', (req, res) => {
    const { key } = req.query;
    
    if (key !== 'dev007dev007dev0') {
        return res.json({ 
            success: false, 
            message: 'Invalid developer key' 
        });
    }
    
    const userList = Object.values(users).map(u => ({
        username: u.username,
        role: u.role,
        coins: u.coins,
        expired: u.expired
    }));
    
    res.json({ 
        success: true, 
        users: userList 
    });
});

// ==================== OTHER ENDPOINTS ====================
app.post('/autoRegister', (req, res) => {
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

    res.json({
        success: true,
        username,
        password,
        expiredDate: expiredStr,
        coins: 100
    });
});

app.get('/refreshCoins', (req, res) => {
    const { key } = req.query;
    const user = Object.values(users).find(u => u.key === key);
    res.json({ 
        coins: user ? user.coins : 0 
    });
});

app.get('/checkUpdate', (req, res) => {
    res.json({
        update_available: false,
        current_version: "4.0",
        latest_version: "4.0"
    });
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        available: [
            '/', '/validate', '/myinfo', '/sendBug', '/refreshCoins',
            '/seller/dashboard', '/seller/createAccount', '/admin/dashboard',
            '/dev/users', '/autoRegister', '/checkUpdate'
        ]
    });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 CYBERENG-SERVER v4.0 - 25 BUG FEATURES            ║
║    Port: ${PORT}                                             ║
║    Status: ONLINE                                       ║
╚══════════════════════════════════════════════════════════╝

✅ 25 BUG FEATURES:
   ${BUG_LIST.slice(0, 5).map(b => `• ${b.bug_name}`).join('\n   ')}
   ... and 20 more!

🔧 ENDPOINTS:
   • POST /validate       - Authentication
   • GET  /myinfo         - User info
   • GET  /sendBug        - Send bug (25 types)
   • GET  /refreshCoins   - Check coins
   • POST /autoRegister   - Auto register
   • GET  /seller/dashboard - Seller page
   • POST /seller/createAccount - Create account
   • GET  /admin/dashboard - Admin panel
   • GET  /dev/users      - Developer

🌐 URL: https://bug-wa-serveren.up.railway.app
    `);
});
