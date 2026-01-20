const express = require('express');
const app = express();
const port = 2000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database in-memory
let users = {
    'developer': {
        username: 'developer',
        password: 'dev2024',
        key: 'dev007dev007dev0',
        role: 'developer',
        coins: 999999999,
        expired: '9999-12-31',
        createdBy: 'system'
    },
    'owner1': {
        username: 'owner1',
        password: 'owner123',
        key: '0000000000000000',
        role: 'owner',
        coins: 500000,
        expired: '2099-12-29',
        createdBy: 'developer'
    }
};

let servers = [];
let logs = [];

// Helper functions
const randomHex = (len) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const randomString = (len) => [...Array(len)].map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');

// Role hierarchy
const ROLE_HIERARCHY = {
    'developer': 4,
    'owner': 3,
    'reseller': 2,
    'member': 1
};

// Middleware: Check role permission
const requireRole = (minRole) => (req, res, next) => {
    const { key } = req.body || req.query;
    const user = Object.values(users).find(u => u.key === key);

    if (!user || ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
        return res.json({ success: false, message: `Require role: ${minRole} or higher` });
    }
    req.user = user;
    next();
};

// ==================== ROOT & INFO ====================
app.get('/', (req, res) => {
    res.json({
        app: 'CYBERENG HIERARCHY SERVER',
        status: 'online',
        version: '2.0',
        server_time: new Date().toISOString(),
        owner: 'ORGAN_GANTENG',
        tunnel_url: req.headers.host,
        endpoints: {
            public: ['/validate', '/autoRegister', '/sendBug', '/refreshCoins', '/redeem'],
            developer: ['/dev', '/dev/users', '/dev/addUser', '/dev/setRole', '/dev/setExpired', '/dev/setCoins'],
            owner: ['/owner/addReseller', '/owner/addMember', '/owner/listUsers', '/owner/setExpired', '/owner/setCoins'],
            reseller: ['/reseller/addMember', '/reseller/setExpired', '/reseller/setCoins'],
            custom: ['/addServer', '/deleteUser', '/checkUpdate', '/getNews', '/listServers']
        }
    });
});

// ==================== DEVELOPER ENDPOINTS ====================
app.get('/dev', requireRole('developer'), (req, res) => {
    res.json({
        server: 'CYBERENG HIERARCHY SERVER',
        your_role: req.user.role,
        users_count: Object.keys(users).length,
        servers_count: servers.length,
        roles_count: {
            developer: Object.values(users).filter(u => u.role === 'developer').length,
            owner: Object.values(users).filter(u => u.role === 'owner').length,
            reseller: Object.values(users).filter(u => u.role === 'reseller').length,
            member: Object.values(users).filter(u => u.role === 'member').length
        },
        endpoints: {
            developer: ['/dev/users', '/dev/addUser', '/dev/deleteUser', '/dev/setRole', '/dev/setExpired', '/dev/setCoins'],
            owner: ['/owner/addReseller', '/owner/addMember', '/owner/listUsers', '/owner/setExpired', '/owner/setCoins'],
            reseller: ['/reseller/addMember', '/reseller/setExpired', '/reseller/setCoins'],
            member: ['/validate', '/sendBug', '/refreshCoins']
        }
    });
});

app.get('/dev/users', requireRole('developer'), (req, res) => {
    const userList = Object.values(users).map(u => ({
        username: u.username,
        role: u.role,
        coins: u.coins,
        expired: u.expired,
        createdBy: u.createdBy,
        key: u.key
    }));
    res.json({ success: true, users: userList });
});

// 🔥 DEVELOPER: BUAT USER DENGAN CUSTOM SEMUA PARAMETER
app.post('/dev/addUser', requireRole('developer'), (req, res) => {
    const { username, password, role, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ success: false, message: 'Username exists' });
    }

    // Validasi expired date (format YYYY-MM-DD)
    let expiredDate = expired || '9999-12-31';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiredDate)) {
        expiredDate = '9999-12-31';
    }

    // Coins unlimited untuk developer
    const userCoins = coins !== undefined ? parseInt(coins) : 
                     (role === 'developer' ? 999999999 : 
                      role === 'owner' ? 500000 : 
                      role === 'reseller' ? 100000 : 0);

    users[username] = {
        username,
        password: password || '123456',
        key: randomHex(16),
        role: role || 'member',
        coins: userCoins,
        expired: expiredDate,
        createdBy: req.user.username
    };

    logs.push({
        action: 'dev_create_user',
        by: req.user.username,
        target: username,
        role: role,
        coins: userCoins,
        expired: expiredDate,
        timestamp: new Date().toISOString()
    });

    res.json({
        success: true,
        message: `✅ User ${username} created with role ${role}`,
        user: users[username]
    });
});

// 🔥 DEVELOPER: SET EXPIRED DATE
app.post('/dev/setExpired', requireRole('developer'), (req, res) => {
    const { username, expired } = req.body;
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }

    // Set expired date (bisa kapan aja)
    users[username].expired = expired || '9999-12-31';

    res.json({
        success: true,
        message: `✅ Expired date for ${username} set to ${users[username].expired}`,
        user: users[username]
    });
});

// 🔥 DEVELOPER: SET COINS (UNLIMITED)
app.post('/dev/setCoins', requireRole('developer'), (req, res) => {
    const { username, coins } = req.body;
    
    if (!users[username]) {
        return res.json({ success: false, message: 'User not found' });
    }

    const newCoins = parseInt(coins) || 0;
    users[username].coins = newCoins;

    res.json({
        success: true,
        message: `✅ Coins for ${username} set to ${newCoins}`,
        user: users[username]
    });
});

// ==================== OWNER ENDPOINTS ====================
// 🔥 OWNER: BUAT RESELLER DENGAN CUSTOM PARAMETER
app.post('/owner/addReseller', requireRole('owner'), (req, res) => {
    const { username, password, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ success: false, message: 'Username exists' });
    }

    // Owner bisa set coins dan expired sendiri
    const userCoins = coins !== undefined ? parseInt(coins) : 100000;
    let expiredDate = expired || '2025-12-31';
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiredDate)) {
        expiredDate = '2025-12-31';
    }

    users[username] = {
        username,
        password: password || 'reseller123',
        key: randomHex(16),
        role: 'reseller',
        coins: userCoins,
        expired: expiredDate,
        createdBy: req.user.username
    };

    res.json({
        success: true,
        message: `✅ Reseller ${username} created`,
        user: users[username]
    });
});

// 🔥 OWNER: BUAT MEMBER DENGAN CUSTOM PARAMETER
app.post('/owner/addMember', requireRole('owner'), (req, res) => {
    const { username, password, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ success: false, message: 'Username exists' });
    }

    // Owner bisa set coins dan expired untuk member
    const userCoins = coins !== undefined ? parseInt(coins) : 0;
    let expiredDate = expired || '2024-12-31';
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiredDate)) {
        expiredDate = '2024-12-31';
    }

    users[username] = {
        username,
        password: password || 'member123',
        key: randomHex(16),
        role: 'member',
        coins: userCoins,
        expired: expiredDate,
        createdBy: req.user.username
    };

    res.json({
        success: true,
        message: `✅ Member ${username} created`,
        user: users[username]
    });
});

// ==================== RESELLER ENDPOINTS ====================
// 🔥 RESELLER: BUAT MEMBER DENGAN CUSTOM PARAMETER
app.post('/reseller/addMember', requireRole('reseller'), (req, res) => {
    const { username, password, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ success: false, message: 'Username exists' });
    }

    // Reseller bisa set coins (max 5000) dan expired (max 30 hari)
    const maxCoins = 5000;
    const userCoins = Math.min(coins !== undefined ? parseInt(coins) : 0, maxCoins);
    
    // Default expired: 30 hari dari sekarang
    let expiredDate = expired;
    if (!expiredDate || !/^\d{4}-\d{2}-\d{2}$/.test(expiredDate)) {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        expiredDate = date.toISOString().split('T')[0];
    }

    users[username] = {
        username,
        password: password || 'member123',
        key: randomHex(16),
        role: 'member',
        coins: userCoins,
        expired: expiredDate,
        createdBy: req.user.username
    };

    res.json({
        success: true,
        message: `✅ Member ${username} created`,
        user: users[username]
    });
});

// ==================== PUBLIC ENDPOINTS (FOR APK) ====================
app.post('/validate', (req, res) => {
    const { username, password, androidId } = req.body;
    const user = users[username];

    console.log(`[VALIDATE] Username: ${username}, AndroidID: ${androidId}`);

    if (!user || user.password !== password) {
        return res.json({ valid: false, message: 'Invalid credentials' });
    }

    // Check if expired
    const currentDate = new Date().toISOString().split('T')[0];
    const isExpired = user.expired < currentDate;

    res.json({
        valid: true,
        expired: isExpired,
        key: user.key,
        expiredDate: user.expired,
        role: user.role,
        coins: user.coins,
        listBug: [
            { bug_id: 'invisible', bug_name: 'DELAY INVISIBLE', price: 50 },
            { bug_id: 'ios_invis', bug_name: 'FC IOS INVISIBLE', price: 75 },
            { bug_id: 'forcloseonemsg', bug_name: 'FC ONE MESSAGE', price: 100 },
            { bug_id: 'crash_app', bug_name: 'CRASH APPLICATION', price: 150 }
        ],
        news: [
            {
                image: 'https://i.imgur.com/6JpYX9W.png',
                title: 'HIERARCHY SYSTEM',
                desc: `Role: ${user.role.toUpperCase()} | Expired: ${user.expired}`
            },
            {
                image: 'https://i.imgur.com/VX5p2Fz.png',
                title: 'COINS BALANCE',
                desc: `You have: ${user.coins} coins`
            },
            {
                image: 'https://i.imgur.com/abc123.png',
                title: 'SERVER STATUS',
                desc: `Connected to: ${req.headers.host}`
            }
        ],
        servers: servers.slice(0, 5)
    });
});

// ... (endpoints lainnya tetap sama seperti di kode lu)

// ==================== START SERVER ====================
app.listen(port, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 CYBERENG HIERARCHY SERVER v2.0                    ║
║    Port: ${port}                                             ║
║    Mode: FULL CUSTOM PARAMETERS                         ║
║    Developer: developer / dev2024                       ║
║    Owner: owner1 / owner123                             ║
║    Features:                                            ║
║    • Custom coins & expired date                        ║
║    • Unlimited parameters for developer                ║
║    • Hierarchy: Dev → Owner → Reseller → Member        ║
╚══════════════════════════════════════════════════════════╝
    `);
    
    console.log(`📡 Developer Endpoints:`);
    console.log(`   POST /dev/addUser     - {username, password, role, coins, expired}`);
    console.log(`   POST /dev/setExpired  - {username, expired}`);
    console.log(`   POST /dev/setCoins    - {username, coins}`);
    
    console.log(`\n👑 Owner Endpoints:`);
    console.log(`   POST /owner/addReseller - {username, password, coins, expired}`);
    console.log(`   POST /owner/addMember   - {username, password, coins, expired}`);
    
    console.log(`\n💼 Reseller Endpoints:`);
    console.log(`   POST /reseller/addMember - {username, password, coins, expired}`);
    
    console.log(`\n📱 Server ready for APK connections!`);
});
