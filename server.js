const express = require('express');
const app = express();
const PORT = process.env.PORT || 2000;

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
const randomHex = (len) => {
    return [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

const randomString = (len) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return [...Array(len)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Role hierarchy
const ROLE_HIERARCHY = {
    'developer': 4,
    'owner': 3,
    'reseller': 2,
    'member': 1
};

// Middleware: Check role permission
const requireRole = (minRole) => {
    return (req, res, next) => {
        const { key } = req.body || req.query;
        const user = Object.values(users).find(u => u.key === key);

        if (!user || ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
            return res.json({ 
                success: false, 
                message: `Require role: ${minRole} or higher` 
            });
        }
        req.user = user;
        next();
    };
};

// ==================== ROOT & INFO ====================
app.get('/', (req, res) => {
    res.json({
        app: 'CYBERENG HIERARCHY SERVER',
        status: 'online',
        version: '3.0',
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
    res.json({ 
        success: true, 
        users: userList 
    });
});

app.post('/dev/addUser', requireRole('developer'), (req, res) => {
    const { username, password, role, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ 
            success: false, 
            message: 'Username exists' 
        });
    }

    // Validasi expired date
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

// ==================== OWNER ENDPOINTS ====================
app.post('/owner/addReseller', requireRole('owner'), (req, res) => {
    const { username, password, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ 
            success: false, 
            message: 'Username exists' 
        });
    }

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

app.post('/owner/addMember', requireRole('owner'), (req, res) => {
    const { username, password, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ 
            success: false, 
            message: 'Username exists' 
        });
    }

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
app.post('/reseller/addMember', requireRole('reseller'), (req, res) => {
    const { username, password, coins, expired } = req.body;
    
    if (users[username]) {
        return res.json({ 
            success: false, 
            message: 'Username exists' 
        });
    }

    const maxCoins = 5000;
    const userCoins = Math.min(coins !== undefined ? parseInt(coins) : 0, maxCoins);
    
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
        return res.json({ 
            valid: false, 
            message: 'Invalid credentials' 
        });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const isExpired = user.expired < currentDate;

    // 🔥 LIST BUG 25 ITEM
    const listBug = [
        // === BUG YANG LU REQUEST (9 ITEM) ===
        { bug_id: 'invisible', bug_name: 'DELAY INVISIBLE', price: 50 },
        { bug_id: 'ios_invis', bug_name: 'FC IOS INVISIBLE', price: 75 },
        { bug_id: 'forcloseonemsg', bug_name: 'FC ONE MESSAGE', price: 100 },
        { bug_id: 'crash_app', bug_name: 'CRASH APPLICATION', price: 150 },
        { bug_id: 'crash_spam', bug_name: 'CRASH SPAM', price: 220 },
        { bug_id: 'crash_system', bug_name: 'CRASH SYSTEM', price: 350 },
        { bug_id: 'kill_android', bug_name: 'KILL ANDROID', price: 600 },
        { bug_id: 'blank_ui', bug_name: 'BLANK UI', price: 180 },
        { bug_id: 'kill_ios', bug_name: 'KILL IOS', price: 700 },
        
        // === TAMBAHAN PREMIUM (16 BUG) ===
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

    res.json({
        valid: true,
        expired: isExpired,
        key: user.key,
        expiredDate: user.expired,
        role: user.role,
        coins: user.coins,
        listBug: listBug,
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
        servers: servers.slice(0, 15)
    });
});

app.post('/autoRegister', (req, res) => {
    const { androidId } = req.body;
    const username = `user_${randomString(6).toLowerCase()}`;
    const password = randomString(8);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 7);
    const expiredStr = expiredDate.toISOString().split('T')[0];

    users[username] = {
        username,
        password,
        key: randomHex(16),
        role: 'member',
        coins: 100,
        expired: expiredStr,
        createdBy: 'system'
    };

    res.json({
        success: true,
        username,
        password,
        role: 'member',
        expiredDate: expiredStr,
        coins: 100,
        message: 'Akun member berhasil dibuat! Valid 7 hari.'
    });
});

app.get('/sendBug', (req, res) => {
    const { key, bug_id, target } = req.query;
    const user = Object.values(users).find(u => u.key === key);

    if (!user) {
        return res.json({ 
            valid: false, 
            message: 'Invalid key' 
        });
    }

    const bugPrices = { 
        developer: 0, 
        owner: 10, 
        reseller: 25, 
        member: 50 
    };
    const price = bugPrices[user.role] || 50;

    if (user.coins < price) {
        return res.json({
            valid: true,
            sended: false,
            insufficient_coins: true,
            current_coins: user.coins,
            required_coins: price,
            message: `Butuh ${price} coin! Role: ${user.role}`
        });
    }

    user.coins -= price;
    logs.push({
        timestamp: new Date().toISOString(),
        user: user.username,
        bug_id,
        target,
        coins_used: price,
        coins_left: user.coins
    });

    res.json({
        valid: true,
        sended: true,
        bug_id,
        target,
        coins_left: user.coins,
        message: `✅ Bug "${bug_id}" terkirim ke ${target || 'default'}! (-${price} coin)`
    });
});

app.get('/refreshCoins', (req, res) => {
    const { key } = req.query;
    const user = Object.values(users).find(u => u.key === key);
    res.json({ 
        coins: user ? user.coins : 0 
    });
});

app.get('/redeem', (req, res) => {
    const { key, code } = req.query;
    const user = Object.values(users).find(u => u.key === key);

    if (!user) {
        return res.json({ valid: false });
    }

    const validCodes = {
        'DEV2024': { role: 'developer', coins: 999999 },
        'OWNERPASS': { role: 'owner', coins: 50000 },
        'RESELLERBONUS': { role: 'reseller', coins: 10000 },
        'MEMBERFREE': { role: 'member', coins: 1000 },
        'ORGAN123': { role: 'developer', coins: 999999999 }
    };

    if (validCodes[code] && ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[validCodes[code].role]) {
        user.coins += validCodes[code].coins;
        res.json({
            valid: true,
            success: true,
            coins: user.coins,
            message: `🎉 Kode ${code} berhasil! +${validCodes[code].coins} coins`
        });
    } else {
        res.json({ 
            valid: true, 
            success: false, 
            message: '❌ Kode tidak valid atau role tidak cukup' 
        });
    }
});

// ==================== CUSTOM ENDPOINTS (DARI APK) ====================
app.post('/addServer', (req, res) => {
    const { server_ip, server_port, server_name } = req.body;

    const newServer = {
        id: servers.length + 1,
        ip: server_ip || '192.168.1.100',
        port: server_port || 3000,
        name: server_name || 'Game Server',
        added_at: new Date().toISOString(),
        status: 'active',
        players: Math.floor(Math.random() * 100) + 1
    };

    servers.push(newServer);

    res.json({
        success: true,
        message: `✅ Server ${server_ip}:${server_port} added successfully!`,
        server: newServer,
        total_servers: servers.length
    });
});

app.get('/deleteUser', (req, res) => {
    const { key, username } = req.query;

    if (key !== 'dev007dev007dev0') {
        return res.json({
            success: false,
            message: 'Invalid developer key'
        });
    }

    if (users[username]) {
        delete users[username];
        res.json({
            success: true,
            message: `✅ User ${username} deleted successfully!`,
            remaining_users: Object.keys(users).length
        });
    } else {
        res.json({
            success: false,
            message: `❌ User ${username} not found!`
        });
    }
});

app.get('/checkUpdate', (req, res) => {
    res.json({
        update_available: false,
        current_version: "1.0.0",
        latest_version: "1.0.0",
        force_update: false,
        changelog: "• Fixed server connection issues\n• Improved performance\n• Added new bug features",
        download_url: "https://example.com/cybereng-update.apk"
    });
});

app.get('/getNews', (req, res) => {
    res.json({
        news: [
            {
                id: 1,
                title: "🎉 CYBERENG REPLICA ACTIVE!",
                content: "Server replica berhasil dijalankan oleh ORGAN_GANTENG",
                date: new Date().toISOString(),
                image: "https://i.imgur.com/6JpYX9W.png"
            },
            {
                id: 2,
                title: "📱 TUNNEL CONNECTION SUCCESS",
                content: `Connected via: ${req.headers.host}`,
                date: new Date().toISOString(),
                image: "https://i.imgur.com/VX5p2Fz.png"
            },
            {
                id: 3,
                title: "⚡ HIERARCHY SYSTEM READY",
                content: "Role system: Developer → Owner → Reseller → Member",
                date: new Date().toISOString(),
                image: "https://i.imgur.com/abc123.png"
            }
        ]
    });
});

app.get('/listServers', (req, res) => {
    res.json({
        success: true,
        servers: servers.slice(0, 20),
        total: servers.length
    });
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found' 
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error' 
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 CYBERENG HIERARCHY SERVER v3.0                    ║
║    Port: ${PORT}                                             ║
║    Mode: 25 BUGS + FULL HIERARCHY                       ║
║    Developer: developer / dev2024                       ║
║    Owner: owner1 / owner123                             ║
║    Reseller: [buat via owner]                           ║
║    Bug Count: 25                                        ║
╚══════════════════════════════════════════════════════════╝
    `);
    
    console.log(`📡 Developer Endpoints:`);
    console.log(`   POST /dev/addUser     - {username, password, role, coins, expired, key}`);
    console.log(`   GET  /dev/users       - ?key=dev007dev007dev0`);
    
    console.log(`\n👑 Owner Endpoints:`);
    console.log(`   POST /owner/addReseller - {username, password, coins?, expired?, key=OWNER_KEY}`);
    console.log(`   POST /owner/addMember   - {username, password, coins?, expired?, key=OWNER_KEY}`);
    
    console.log(`\n💼 Reseller Endpoints:`);
    console.log(`   POST /reseller/addMember - {username, password, coins?(max5000), expired?, key=RESELLER_KEY}`);
    
    console.log(`\n📱 Public Endpoints (for APK):`);
    console.log(`   POST /validate       - {username, password}`);
    console.log(`   GET  /sendBug        - ?key=XXX&bug_id=XXX&target=XXX`);
    console.log(`   POST /addServer      - {server_ip, server_port, server_name}`);
    console.log(`   GET  /refreshCoins   - ?key=XXX`);
    console.log(`   GET  /redeem         - ?key=XXX&code=XXX`);
    
    console.log(`\n✅ Server ready!`);
    console.log(`🌐 URL: ${process.env.RAILWAY_STATIC_URL || `http://localhost:${PORT}`}`);
});
