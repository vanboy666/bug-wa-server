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
        expired: '9999-999-999',
        createdBy: 'system'
    },
    'owner1': {
        username: 'owner1',
        password: 'owner123',
        key: '0000000000000000',
        role: 'owner',
        coins: 500000,
        expired: '2299-20-31',
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
        app: 'CYBERENG REPLICA SERVER',
        status: 'online',
        version: '1.0.0',
        server_time: new Date().toISOString(),
        owner: 'ORGAN_GANTENG',
        tunnel_url: req.headers.host,
        endpoints: {
            public: ['/validate', '/autoRegister', '/sendBug', '/refreshCoins', '/redeem'],
            developer: ['/dev', '/dev/users', '/dev/addUser', '/dev/setRole'],
            owner: ['/owner/addReseller', '/owner/addMember', '/owner/listUsers'],
            reseller: ['/reseller/addMember'],
            custom: ['/addServer', '/deleteUser', '/checkUpdate', '/getNews']
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
            developer: ['/dev/users', '/dev/addUser', '/dev/deleteUser', '/dev/setRole'],
            owner: ['/owner/addReseller', '/owner/addMember', '/owner/listUsers'],
            reseller: ['/reseller/addMember'],
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

app.post('/dev/addUser', requireRole('developer'), (req, res) => {
    const { username, password, role, coins } = req.body;
    if (users[username]) return res.json({ success: false, message: 'Username exists' });

    users[username] = {
        username,
        password: password || '123456',
        key: randomHex(16),
        role: role || 'member',
        coins: coins || (role === 'developer' ? 999999999 : role === 'owner' ? 500000 : 0),
        expired: '9999-12-31',
        createdBy: req.user.username
    };

    res.json({ success: true, user: users[username] });
});

app.post('/dev/setRole', requireRole('developer'), (req, res) => {
    const { username, newRole } = req.body;
    if (!users[username]) return res.json({ success: false, message: 'User not found' });

    users[username].role = newRole;
    res.json({ success: true, user: users[username] });
});

// ==================== OWNER ENDPOINTS ====================
app.post('/owner/addReseller', requireRole('owner'), (req, res) => {
    const { username, password } = req.body;
    if (users[username]) return res.json({ success: false, message: 'Username exists' });

    users[username] = {
        username,
        password: password || 'reseller123',
        key: randomHex(16),
        role: 'reseller',
        coins: 100000,
        expired: '2299-12-31',
        createdBy: req.user.username
    };

    res.json({
        success: true,
        message: `Reseller ${username} created`,
        user: users[username]
    });
});

app.post('/owner/addMember', requireRole('owner'), (req, res) => {
    const { username, password } = req.body;
    if (users[username]) return res.json({ success: false, message: 'Username exists' });

    users[username] = {
        username,
        password: password || 'member123',
        key: randomHex(16),
        role: 'member',
        coins: 1000,
        expired: '2050-12-31',
        createdBy: req.user.username
    };

    res.json({
        success: true,
        message: `Member ${username} created`,
        user: users[username]
    });
});

app.get('/owner/listUsers', requireRole('owner'), (req, res) => {
    const userList = Object.values(users)
        .filter(u => u.createdBy === req.user.username)
        .map(u => ({
            username: u.username,
            role: u.role,
            coins: u.coins,
            expired: u.expired
        }));
    res.json({ success: true, users: userList });
});

// ==================== RESELLER ENDPOINTS ====================
app.post('/reseller/addMember', requireRole('reseller'), (req, res) => {
    const { username, password } = req.body;
    if (users[username]) return res.json({ success: false, message: 'Username exists' });

    users[username] = {
        username,
        password: password || 'member123',
        key: randomHex(16),
        role: 'member',
        coins: 0,
        expired: '2024-12-31',
        createdBy: req.user.username
    };

    res.json({
        success: true,
        message: `Member ${username} created`,
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

    res.json({
        valid: true,
        expired: false,
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

    if (!user) return res.json({ valid: false, message: 'Invalid key' });

    const bugPrices = { developer: 0, owner: 10, reseller: 25, member: 50 };
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
        message: `✅ Bug "${bug_id}" terkirim ke ${target || 'default'}! (-${price} coins)`
    });
});

app.get('/refreshCoins', (req, res) => {
    const { key } = req.query;
    const user = Object.values(users).find(u => u.key === key);
    res.json({ coins: user ? user.coins : 0 });
});

app.get('/redeem', (req, res) => {
    const { key, code } = req.query;
    const user = Object.values(users).find(u => u.key === key);

    if (!user) return res.json({ valid: false });

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
        res.json({ valid: true, success: false, message: '❌ Kode tidak valid atau role tidak memenuhi' });
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

    // Simulate authentication
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
        changelog: "• Fixed server connection issues\n• Improved performance\n• Added new bugs",
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

// ==================== START SERVER ====================
app.listen(port, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 CYBERENG REPLICA SERVER v2.0                      ║
║    Port: ${port}                                             ║
║    Mode: FULL HIERARCHY SYSTEM                          ║
║    Developer: developer / dev2024                       ║
║    Owner: owner1 / owner123                             ║
║    Tunnel: https://ag301ae928abc5.ihr_life              ║
╚══════════════════════════════════════════════════════════╝
    `);
    console.log(`📡 Role Hierarchy: Developer (4) → Owner (3) → Reseller (2) → Member (1)`);
    console.log(`🔗 Developer Dashboard: http://0.0.0.0:${port}/dev?key=dev007dev007dev0`);
    console.log(`🌐 Public Endpoints:`);
    console.log(`   ✅ /validate      - User authentication`);
    console.log(`   ✅ /addServer     - Add game server`);
    console.log(`   ✅ /deleteUser    - Delete user (dev only)`);
    console.log(`   ✅ /sendBug       - Send bug/exploit`);
    console.log(`   ✅ /refreshCoins  - Check coin balance`);
    console.log(`\n📱 Server ready for APK connections!`);
    console.log(`💡 APK should connect to: https://rdsvapimalwerm.vannxteam.vercel.app`);
});
