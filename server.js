const express = require('express');
const app = express();
const PORT = process.env.PORT || 2000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database in-memory
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
    'developer': 6,
    'owner': 5,
    'reseller': 4,
    'vip': 3,
    'partner': 2,
    'member': 1
};

// ==================== ROOT & DASHBOARD ====================
app.get('/', (req, res) => {
    res.json({
        app: 'CYBERENG-SERVER V4.0',
        status: 'online',
        version: '4.0',
        owner: 'ORGAN_GANTENG',
        time: new Date().toISOString(),
        quick_actions: {
            seller_page: '/seller/dashboard?key=SELLER_KEY',
            admin_panel: '/admin/dashboard?key=ADMIN_KEY'
        },
        stats: {
            total_users: Object.keys(users).length,
            total_servers: servers.length,
            online_users: Object.keys(users).length
        }
    });
});

// ==================== QUICK ACTIONS DASHBOARD ====================
app.get('/dashboard', (req, res) => {
    const { key } = req.query;
    const user = Object.values(users).find(u => u.key === key);
    
    if (!user) {
        return res.json({ success: false, message: 'Invalid key' });
    }
    
    // DASHBOARD MENU SESUAI FOTO
    res.json({
        success: true,
        user: {
            username: user.username,
            role: user.role.toUpperCase(),
            expired: user.expired,
            coins: user.coins
        },
        quick_actions: [
            {
                id: 'seller_page',
                title: 'Seller Page',
                icon: '🏪',
                description: 'Create accounts & extend durations',
                endpoint: '/seller/dashboard',
                accessible: ['owner', 'reseller', 'seller'].includes(user.role)
            },
            {
                id: 'admin_panel',
                title: 'Admin Panel',
                icon: '🔧',
                description: 'Delete users, create accounts, user list',
                endpoint: '/admin/dashboard',
                accessible: ['owner', 'developer'].includes(user.role)
            }
        ],
        menus: {
            seller_page: [
                { title: 'Create New Account', type: 'form', fields: ['username', 'password', 'duration_days'] },
                { title: 'Extend Account Duration', type: 'form', fields: ['username', 'additional_days'] }
            ],
            admin_panel: [
                { title: 'Delete User', type: 'form', fields: ['username'] },
                { title: 'Create Account', type: 'form', fields: ['username', 'password', 'duration_days', 'role'] },
                { title: 'User List', type: 'list', filter: ['all', 'member', 'reseller', 'owner', 'vip', 'partner'] }
            ]
        }
    });
});

// ==================== SELLER PAGE SYSTEM ====================
app.get('/seller/dashboard', (req, res) => {
    const { key } = req.query;
    const seller = Object.values(users).find(u => u.key === key && ['owner', 'reseller', 'seller'].includes(u.role));
    
    if (!seller) {
        return res.json({ success: false, message: 'Akses ditolak. Hanya seller/owner/reseller' });
    }
    
    // SELLER PAGE INTERFACE SESUAI FOTO
    res.json({
        success: true,
        page: 'SELLER_PAGE',
        title: 'Account Management',
        subtitle: 'Create new accounts or extend existing ones',
        
        // MENU 1: CREATE NEW ACCOUNT (SESUAI FOTO)
        create_account: {
            title: 'Create New Account',
            description: 'Create a new user account with specified duration',
            fields: [
                {
                    name: 'username',
                    type: 'text',
                    placeholder: 'Enter username',
                    required: true
                },
                {
                    name: 'password',
                    type: 'password',
                    placeholder: 'Enter password',
                    required: true
                },
                {
                    name: 'duration_days',
                    type: 'number',
                    placeholder: 'Duration (days)',
                    required: true,
                    min: 1,
                    max: 3650
                }
            ],
            button_text: 'CREATE ACCOUNT',
            endpoint: '/seller/createAccount'
        },
        
        // MENU 2: EXTEND ACCOUNT DURATION (SESUAI FOTO)
        extend_account: {
            title: 'Extend Account Duration',
            description: 'Add more days to an existing user account',
            fields: [
                {
                    name: 'username',
                    type: 'text',
                    placeholder: 'Enter username',
                    required: true
                },
                {
                    name: 'additional_days',
                    type: 'number',
                    placeholder: 'Additional Days',
                    required: true,
                    min: 1,
                    max: 3650
                }
            ],
            button_text: 'UPDATE DURATION',
            endpoint: '/seller/extendAccount'
        },
        
        seller_info: {
            name: seller.username,
            role: seller.role,
            can_create: true
        }
    });
});

// CREATE ACCOUNT - SELLER
app.post('/seller/createAccount', (req, res) => {
    const { seller_key, username, password, duration_days } = req.body;
    
    // Validasi
    if (!seller_key || !username || !password || !duration_days) {
        return res.json({
            success: false,
            message: "Semua field wajib diisi"
        });
    }
    
    const seller = Object.values(users).find(u => u.key === seller_key && ['owner', 'reseller', 'seller'].includes(u.role));
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
    
    // Hitung expired date
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + parseInt(duration_days));
    const expiredStr = expiredDate.toISOString().split('T')[0];
    
    // Generate user ID
    const userId = "USR" + Date.now() + Math.floor(Math.random() * 1000);
    
    // Buat user baru
    users[username] = {
        userId: userId,
        username: username,
        password: password,
        key: randomHex(16),
        role: 'member',
        coins: 0,
        expired: expiredStr,
        createdBy: seller.username,
        parent: seller.username,
        createdAt: new Date().toISOString(),
        seller: seller.username
    };
    
    res.json({
        success: true,
        message: `✅ Account ${username} created successfully!`,
        account_details: {
            username: username,
            password: password,
            expired_date: expiredStr,
            duration_days: duration_days,
            role: 'member',
            created_by: seller.username
        }
    });
});

// EXTEND ACCOUNT - SELLER
app.post('/seller/extendAccount', (req, res) => {
    const { seller_key, username, additional_days } = req.body;
    
    if (!seller_key || !username || !additional_days) {
        return res.json({
            success: false,
            message: "Semua field wajib diisi"
        });
    }
    
    const seller = Object.values(users).find(u => u.key === seller_key && ['owner', 'reseller', 'seller'].includes(u.role));
    if (!seller) {
        return res.json({
            success: false,
            message: "Seller tidak valid"
        });
    }
    
    const user = users[username];
    if (!user) {
        return res.json({
            success: false,
            message: "User tidak ditemukan"
        });
    }
    
    // Cek apakah seller adalah parent dari user ini
    if (user.parent !== seller.username && seller.role !== 'owner') {
        return res.json({
            success: false,
            message: "Tidak memiliki izin untuk user ini"
        });
    }
    
    // Perpanjang masa aktif
    const currentExpired = new Date(user.expired);
    const newExpired = new Date(currentExpired);
    newExpired.setDate(newExpired.getDate() + parseInt(additional_days));
    user.expired = newExpired.toISOString().split('T')[0];
    
    res.json({
        success: true,
        message: `✅ Account ${username} extended by ${additional_days} days`,
        new_expired: user.expired,
        additional_days: additional_days
    });
});

// ==================== ADMIN PANEL SYSTEM ====================
app.get('/admin/dashboard', (req, res) => {
    const { key } = req.query;
    const admin = Object.values(users).find(u => u.key === key && ['owner', 'developer'].includes(u.role));
    
    if (!admin) {
        return res.json({ success: false, message: 'Akses ditolak. Hanya admin/owner/developer' });
    }
    
    // ADMIN PANEL INTERFACE SESUAI FOTO
    res.json({
        success: true,
        page: 'ADMIN_PANEL',
        title: 'Admin Panel',
        
        // MENU NAVIGASI (SESUAI FOTO)
        navigation: [
            { id: 'delete_user', title: 'Delete User', icon: '🗑️' },
            { id: 'create_account', title: 'Create Account', icon: '👤' },
            { id: 'user_list', title: 'User List', icon: '📋' }
        ],
        
        // DELETE USER SECTION (SESUAI FOTO)
        delete_user_section: {
            title: 'Delete User',
            description: 'Permanently remove a user from the system',
            fields: [
                {
                    name: 'username',
                    type: 'text',
                    placeholder: 'Enter username to delete',
                    required: true
                }
            ],
            button_text: 'DELETE USER',
            endpoint: '/admin/deleteUser',
            warning: 'This action cannot be undone!'
        },
        
        // CREATE ACCOUNT SECTION (SESUAI FOTO)
        create_account_section: {
            title: 'Create Account',
            description: 'Add a new user to the system',
            fields: [
                {
                    name: 'username',
                    type: 'text',
                    placeholder: 'Enter username',
                    required: true
                },
                {
                    name: 'password',
                    type: 'password',
                    placeholder: 'Enter password',
                    required: true
                },
                {
                    name: 'duration_days',
                    type: 'number',
                    placeholder: 'Enter duration in days',
                    required: true,
                    min: 1,
                    max: 3650
                },
                {
                    name: 'role',
                    type: 'select',
                    options: [
                        { value: 'member', label: 'MEMBER' },
                        { value: 'vip', label: 'VIP' },
                        { value: 'reseller', label: 'RESELLER' },
                        { value: 'partner', label: 'PARTNER' },
                        { value: 'owner', label: 'OWNER' }
                    ],
                    default: 'member',
                    required: true
                }
            ],
            button_text: 'CREATE ACCOUNT',
            endpoint: '/admin/createAccount'
        },
        
        // USER LIST SECTION (SESUAI FOTO)
        user_list_section: {
            title: 'User List',
            filter: {
                label: 'Filter by Role:',
                options: [
                    { value: 'all', label: 'ALL' },
                    { value: 'member', label: 'MEMBER' },
                    { value: 'vip', label: 'VIP' },
                    { value: 'reseller', label: 'RESELLER' },
                    { value: 'owner', label: 'OWNER' },
                    { value: 'partner', label: 'PARTNER' }
                ],
                default: 'all'
            },
            columns: ['Username', 'Role', 'Expired', 'Parent', 'Actions'],
            endpoint: '/admin/userList',
            actions: [
                { type: 'delete', icon: '🗑️', color: 'red', endpoint: '/admin/deleteUser' }
            ]
        },
        
        admin_info: {
            name: admin.username,
            role: admin.role,
            permissions: ['create', 'delete', 'view_all']
        }
    });
});

// ADMIN CREATE ACCOUNT WITH ROLE (SESUAI FOTO)
app.post('/admin/createAccount', (req, res) => {
    const { admin_key, username, password, duration_days, role } = req.body;
    
    if (!admin_key || !username || !password || !duration_days || !role) {
        return res.json({
            success: false,
            message: "Semua field wajib diisi"
        });
    }
    
    const admin = Object.values(users).find(u => u.key === admin_key && ['owner', 'developer'].includes(u.role));
    if (!admin) {
        return res.json({
            success: false,
            message: "Admin tidak valid"
        });
    }
    
    if (users[username]) {
        return res.json({
            success: false,
            message: "Username sudah digunakan"
        });
    }
    
    // Validasi role
    const validRoles = ['member', 'vip', 'reseller', 'partner', 'owner'];
    if (!validRoles.includes(role.toLowerCase())) {
        return res.json({
            success: false,
            message: "Role tidak valid"
        });
    }
    
    // Hitung expired date
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + parseInt(duration_days));
    const expiredStr = expiredDate.toISOString().split('T')[0];
    
    // Tentukan coins berdasarkan role
    const roleCoins = {
        'member': 0,
        'vip': 50000,
        'reseller': 100000,
        'partner': 75000,
        'owner': 500000
    };
    
    // Generate user ID
    const userId = "USR" + Date.now() + Math.floor(Math.random() * 1000);
    
    // Buat user baru
    users[username] = {
        userId: userId,
        username: username,
        password: password,
        key: randomHex(16),
        role: role.toLowerCase(),
        coins: roleCoins[role.toLowerCase()] || 0,
        expired: expiredStr,
        createdBy: admin.username,
        parent: 'SYSTEM',
        createdAt: new Date().toISOString(),
        is_admin_created: true
    };
    
    res.json({
        success: true,
        message: `✅ Account ${username} created as ${role.toUpperCase()}!`,
        account_details: {
            username: username,
            password: password,
            role: role.toUpperCase(),
            expired_date: expiredStr,
            duration_days: duration_days,
            coins: roleCoins[role.toLowerCase()] || 0,
            created_by: admin.username
        }
    });
});

// ADMIN DELETE USER
app.post('/admin/deleteUser', (req, res) => {
    const { admin_key, username } = req.body;
    
    if (!admin_key || !username) {
        return res.json({
            success: false,
            message: "Username wajib diisi"
        });
    }
    
    const admin = Object.values(users).find(u => u.key === admin_key && ['owner', 'developer'].includes(u.role));
    if (!admin) {
        return res.json({
            success: false,
            message: "Admin tidak valid"
        });
    }
    
    if (!users[username]) {
        return res.json({
            success: false,
            message: "User tidak ditemukan"
        });
    }
    
    // Jangan hapus user utama
    const protectedUsers = ['developer', 'organ', 'owner1'];
    if (protectedUsers.includes(username)) {
        return res.json({
            success: false,
            message: "Tidak dapat menghapus user utama"
        });
    }
    
    // Hapus user
    const deletedUser = users[username];
    delete users[username];
    
    res.json({
        success: true,
        message: `✅ User ${username} deleted permanently!`,
        deleted_user: {
            username: username,
            role: deletedUser.role,
            expired: deletedUser.expired
        }
    });
});

// ADMIN USER LIST WITH FILTER (SESUAI FOTO)
app.get('/admin/userList', (req, res) => {
    const { admin_key, filter_role } = req.query;
    
    const admin = Object.values(users).find(u => u.key === admin_key && ['owner', 'developer'].includes(u.role));
    if (!admin) {
        return res.json({ success: false, message: 'Akses ditolak' });
    }
    
    let userList = Object.values(users);
    
    // Filter berdasarkan role jika ada
    if (filter_role && filter_role !== 'all') {
        userList = userList.filter(user => user.role === filter_role.toLowerCase());
    }
    
    // Format data sesuai tampilan di foto
    const formattedUsers = userList.map(user => ({
        username: user.username,
        role: user.role.toUpperCase(),
        expired: user.expired,
        parent: user.parent || 'SYSTEM',
        coins: user.coins,
        created_at: user.createdAt || 'N/A',
        can_delete: !['developer', 'organ', 'owner1'].includes(user.username)
    }));
    
    res.json({
        success: true,
        filter_applied: filter_role || 'all',
        total_users: formattedUsers.length,
        users: formattedUsers,
        columns: [
            { key: 'username', label: 'Username' },
            { key: 'role', label: 'Role' },
            { key: 'expired', label: 'Expired' },
            { key: 'parent', label: 'Parent' },
            { key: 'actions', label: 'Actions' }
        ]
    });
});

// ==================== MYINFO ENDPOINT (FIX) ====================
app.get('/myinfo', (req, res) => {
    const { username, password, key } = req.query;
    
    if (!username || !password || !key) {
        return res.json({
            valid: false,
            message: "Parameter tidak lengkap"
        });
    }
    
    const user = users[username];
    
    if (!user || user.password !== password || user.key !== key) {
        return res.json({ 
            valid: false, 
            message: 'Invalid credentials' 
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
        parent: user.parent
    });
});

// ==================== VALIDATE ENDPOINT (FIX) ====================
app.post('/validate', (req, res) => {
    const { username, password, androidId } = req.body;
    const user = users[username];

    if (!user || user.password !== password) {
        return res.json({ 
            valid: false, 
            message: 'Invalid credentials' 
        });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const isExpired = user.expired < currentDate;

    // LIST BUG 25 ITEM
    const listBug = [
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

    res.json({
        valid: true,
        expired: isExpired,
        key: user.key,
        expiredDate: user.expired,
        role: user.role,
        coins: user.coins,
        listBug: listBug,
        quick_actions: [
            {
                id: 'seller_page',
                title: 'Seller Page',
                endpoint: '/seller/dashboard?key=' + user.key,
                available: ['owner', 'reseller', 'seller'].includes(user.role)
            },
            {
                id: 'admin_panel',
                title: 'Admin Panel',
                endpoint: '/admin/dashboard?key=' + user.key,
                available: ['owner', 'developer'].includes(user.role)
            }
        ],
        servers: servers.slice(0, 10)
    });
});

// ==================== ENDPOINT LAINNYA ====================
app.post('/autoRegister', (req, res) => {
    const { androidId } = req.body;
    const username = `user_${randomString(6).toLowerCase()}`;
    const password = randomString(8);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 7);
    const expiredStr = expiredDate.toISOString().split('T')[0];

    const userId = "USR" + Date.now();

    users[username] = {
        userId: userId,
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

app.post('/addServer', (req, res) => {
    const { server_ip, server_port, server_name, key } = req.body;

    if (!key) {
        return res.json({
            success: false,
            message: "Key diperlukan"
        });
    }

    const user = Object.values(users).find(u => u.key === key);
    if (!user) {
        return res.json({
            success: false,
            message: "User tidak ditemukan"
        });
    }

    const newServer = {
        id: servers.length + 1,
        ip: server_ip || '192.168.1.100',
        port: server_port || 3000,
        name: server_name || 'Game Server',
        added_at: new Date().toISOString(),
        status: 'active',
        players: Math.floor(Math.random() * 100) + 1,
        added_by: user.username
    };

    servers.push(newServer);

    res.json({
        success: true,
        message: `✅ Server ${server_ip}:${server_port} added successfully!`,
        server: newServer,
        total_servers: servers.length
    });
});

app.get('/checkUpdate', (req, res) => {
    res.json({
        update_available: false,
        current_version: "4.0",
        latest_version: "4.0",
        force_update: false,
        changelog: "• Added Seller Page with Create Account & Extend Duration\n• Added Admin Panel with Delete User, Create Account, User List\n• User List with filter by role\n• Added role VIP, RESELLER, OWNER, MEMBER, PARTNER\n• Fixed /myinfo endpoint\n• Fixed /validate endpoint\n• 25 bug features available",
        download_url: "https://example.com/cybereng-update.apk"
    });
});

app.get('/getNews', (req, res) => {
    res.json({
        news: [
            {
                id: 1,
                title: "🎉 SELLER PAGE RELEASED!",
                content: "Fitur Seller Page dengan create account dan extend duration sekarang aktif",
                date: new Date().toISOString(),
                image: "https://i.imgur.com/6JpYX9W.png"
            },
            {
                id: 2,
                title: "🔧 ADMIN PANEL UPDATE",
                content: "Admin panel dengan delete user, create account, dan user list filter",
                date: new Date().toISOString(),
                image: "https://i.imgur.com/VX5p2Fz.png"
            },
            {
                id: 3,
                title: "📱 USER LIST FILTER",
                content: "Filter user by role: MEMBER, VIP, RESELLER, OWNER, PARTNER",
                date: new Date().toISOString(),
                image: "https://i.imgur.com/abc123.png"
            }
        ]
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 CYBERENG-SERVER V4.0 - COMPLETE EDITION           ║
║    Port: ${PORT}                                             ║
║    Owner: ORGAN_GANTENG                                 ║
║    Features:                                            ║
║    ✅ Seller Page (Create Account, Extend Duration)     ║
║    ✅ Admin Panel (Delete User, Create Account)         ║
║    ✅ User List with Filter & Delete Button            ║
║    ✅ 25 Bug Features                                   ║
║    ✅ /myinfo & /validate Fixed                        ║
║    ✅ Role: VIP, RESELLER, OWNER, MEMBER, PARTNER      ║
╚══════════════════════════════════════════════════════════╝
    `);
    
    console.log(`📊 QUICK ACCESS:`);
    console.log(`   Login: organ / organ123`);
    console.log(`   Key: 677890`);
    console.log(`   Seller Page: /seller/dashboard?key=677890`);
    console.log(`   Admin Panel: /admin/dashboard?key=677890`);
    
    console.log(`\n🔧 MAIN ENDPOINTS:`);
    console.log(`   POST /validate       - Login user`);
    console.log(`   GET  /myinfo         - User info`);
    console.log(`   GET  /dashboard      - Quick actions`);
    console.log(`   POST /addServer      - Add server`);
    console.log(`   GET  /sendBug        - Send bug`);
    
    console.log(`\n🏪 SELLER PAGE:`);
    console.log(`   GET  /seller/dashboard          - Seller page interface`);
    console.log(`   POST /seller/createAccount      - Create new account`);
    console.log(`   POST /seller/extendAccount      - Extend account duration`);
    
    console.log(`\n🔧 ADMIN PANEL:`);
    console.log(`   GET  /admin/dashboard          - Admin panel interface`);
    console.log(`   POST /admin/createAccount      - Create account with role`);
    console.log(`   POST /admin/deleteUser         - Delete user permanently`);
    console.log(`   GET  /admin/userList           - User list with filter`);
    
    console.log(`\n✅ Server ready!`);
    console.log(`🌐 URL: ${process.env.RAILWAY_STATIC_URL || `http://localhost:${PORT}`}`);
});
