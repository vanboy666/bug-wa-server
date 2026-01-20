// ====================================================
// CYBERENG-SERVER v4.0 - COMPLETE VERSION (RAILWAY READY)
// Author: ORGAN_GANTENG
// Repository: github.com/vanboy666/bug-wa-server
// ====================================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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
let news = [
    {
        id: 1,
        title: "🎉 CYBERENG SERVER v4.0 LAUNCHED",
        content: "Server dengan semua fitur lengkap telah aktif!",
        date: "2024-01-10",
        image: "https://i.imgur.com/6JpYX9W.png"
    },
    {
        id: 2,
        title: "🛠️ SELLER PAGE AVAILABLE",
        content: "Fitur Seller Page untuk create account dan extend duration sekarang ready",
        date: "2024-01-10",
        image: "https://i.imgur.com/VX5p2Fz.png"
    },
    {
        id: 3,
        title: "🔧 ADMIN PANEL UPDATED",
        content: "Admin Panel dengan user management system telah diperbarui",
        date: "2024-01-10",
        image: "https://i.imgur.com/abc123.png"
    }
];

// ==================== HELPER FUNCTIONS ====================
const randomHex = (len) => {
    let result = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

const randomString = (len) => {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
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

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
    res.json({
        app: 'CYBERENG-SERVER',
        version: '4.0',
        status: 'online',
        owner: 'ORGAN_GANTENG',
        server_time: new Date().toISOString(),
        endpoints: {
            public: ['/validate', '/myinfo', '/autoRegister', '/sendBug', '/refreshCoins', '/redeem', '/checkUpdate', '/getNews'],
            seller: ['/seller/dashboard', '/seller/createAccount', '/seller/extendAccount'],
            admin: ['/admin/dashboard', '/admin/createAccount', '/admin/deleteUser', '/admin/userList'],
            developer: ['/dev/users', '/dev/addUser', '/dev/deleteUser', '/dev/setCoins'],
            owner: ['/owner/addReseller', '/owner/addMember', '/owner/listUsers'],
            reseller: ['/reseller/addMember'],
            server: ['/addServer', '/listServers', '/deleteServer']
        }
    });
});

// ==================== VALIDATE ENDPOINT (FIXED) ====================
app.post('/validate', (req, res) => {
    try {
        console.log('🔍 [VALIDATE] Request received:', req.body);
        
        const username = req.body.username || req.body.user || req.body.user_id;
        const password = req.body.password || req.body.pass || req.body.pwd;
        const androidId = req.body.androidId || req.body.device_id || req.body.android_id;
        
        console.log('🔍 [VALIDATE] Parsed:', { username, password, androidId });
        
        if (!username || !password) {
            console.log('❌ [VALIDATE] Missing credentials');
            return res.json({ 
                valid: false, 
                message: 'Username dan password diperlukan' 
            });
        }
        
        const userKey = Object.keys(users).find(key => 
            key.toLowerCase() === username.toLowerCase()
        );
        
        if (!userKey) {
            console.log('❌ [VALIDATE] User not found:', username);
            return res.json({ 
                valid: false, 
                message: 'Akun tidak ditemukan' 
            });
        }
        
        const user = users[userKey];
        
        if (user.password !== password) {
            console.log('❌ [VALIDATE] Wrong password for:', username);
            return res.json({ 
                valid: false, 
                message: 'Password salah' 
            });
        }
        
        const currentDate = new Date().toISOString().split('T')[0];
        const isExpired = user.expired < currentDate;
        
        if (isExpired) {
            console.log('⚠️ [VALIDATE] Account expired:', user.expired);
        }
        
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
            { bug_id: 'android_invis', bug_name: 'ANDROID INVISIBLE', price: 60 }
        ];
        
        logs.push({
            type: 'login',
            username: username,
            androidId: androidId,
            timestamp: new Date().toISOString(),
            ip: req.ip
        });
        
        console.log('✅ [VALIDATE] Success for:', username);
        
        res.json({
            valid: true,
            expired: isExpired,
            key: user.key,
            expiredDate: user.expired,
            role: user.role,
            coins: user.coins,
            listBug: listBug,
            news: news,
            servers: servers.slice(0, 15),
            quickActions: {
                sellerPage: ['owner', 'reseller'].includes(user.role),
                adminPanel: ['owner', 'developer'].includes(user.role),
                developerPanel: user.role === 'developer'
            },
            message: `Welcome ${username}! Role: ${user.role}`
        });
        
    } catch (error) {
        console.error('🔥 [VALIDATE] Error:', error);
        res.json({ 
            valid: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

// ==================== MYINFO ENDPOINT ====================
app.get('/myinfo', (req, res) => {
    try {
        const { username, password, key } = req.query;
        
        console.log('🔍 [MYINFO] Request for:', username);
        
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

        console.log('✅ [MYINFO] Success for:', username);
        
        res.json({
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
        console.error('🔥 [MYINFO] Error:', error);
        res.json({ 
            valid: false, 
            message: 'Server error' 
        });
    }
});

// ==================== SELLER PAGE SYSTEM ====================
app.get('/seller/dashboard', (req, res) => {
    const { key } = req.query;
    
    const seller = Object.values(users).find(u => 
        u.key === key && ['owner', 'reseller', 'seller'].includes(u.role)
    );
    
    if (!seller) {
        return res.json({ 
            success: false, 
            message: 'Akses ditolak. Hanya seller/owner/reseller' 
        });
    }
    
    res.json({
        success: true,
        page: 'SELLER_PAGE',
        title: 'Account Management',
        subtitle: 'Create new accounts or extend existing ones',
        
        createAccount: {
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
        
        extendAccount: {
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
        
        sellerInfo: {
            name: seller.username,
            role: seller.role.toUpperCase(),
            canCreate: true
        }
    });
});

app.post('/seller/createAccount', (req, res) => {
    try {
        const { seller_key, username, password, duration_days } = req.body;
        
        console.log('🔍 [SELLER CREATE] Request:', { seller_key, username });
        
        if (!seller_key || !username || !password || !duration_days) {
            return res.json({
                success: false,
                message: "Semua field wajib diisi"
            });
        }
        
        const seller = Object.values(users).find(u => 
            u.key === seller_key && ['owner', 'reseller', 'seller'].includes(u.role)
        );
        
        if (!seller) {
            return res.json({
                success: false,
                message: "Seller tidak valid atau tidak memiliki akses"
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
        
        const userId = "USR" + Date.now() + Math.floor(Math.random() * 1000);
        
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
        
        logs.push({
            type: 'seller_create',
            seller: seller.username,
            created_user: username,
            duration_days: duration_days,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ [SELLER CREATE] Success:', username);
        
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
        
    } catch (error) {
        console.error('🔥 [SELLER CREATE] Error:', error);
        res.json({
            success: false,
            message: "Server error: " + error.message
        });
    }
});

app.post('/seller/extendAccount', (req, res) => {
    try {
        const { seller_key, username, additional_days } = req.body;
        
        console.log('🔍 [SELLER EXTEND] Request:', { seller_key, username, additional_days });
        
        if (!seller_key || !username || !additional_days) {
            return res.json({
                success: false,
                message: "Semua field wajib diisi"
            });
        }
        
        const seller = Object.values(users).find(u => 
            u.key === seller_key && ['owner', 'reseller', 'seller'].includes(u.role)
        );
        
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
        
        if (user.parent !== seller.username && seller.role !== 'owner') {
            return res.json({
                success: false,
                message: "Tidak memiliki izin untuk memperpanjang akun ini"
            });
        }
        
        const currentExpired = new Date(user.expired);
        const newExpired = new Date(currentExpired);
        newExpired.setDate(newExpired.getDate() + parseInt(additional_days));
        user.expired = newExpired.toISOString().split('T')[0];
        
        logs.push({
            type: 'seller_extend',
            seller: seller.username,
            user: username,
            additional_days: additional_days,
            new_expired: user.expired,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ [SELLER EXTEND] Success:', username);
        
        res.json({
            success: true,
            message: `✅ Account ${username} extended by ${additional_days} days`,
            new_expired: user.expired,
            additional_days: additional_days
        });
        
    } catch (error) {
        console.error('🔥 [SELLER EXTEND] Error:', error);
        res.json({
            success: false,
            message: "Server error: " + error.message
        });
    }
});

// ==================== ADMIN PANEL SYSTEM ====================
app.get('/admin/dashboard', (req, res) => {
    const { key } = req.query;
    
    const admin = Object.values(users).find(u => 
        u.key === key && ['owner', 'developer'].includes(u.role)
    );
    
    if (!admin) {
        return res.json({ 
            success: false, 
            message: 'Akses ditolak. Hanya admin/owner/developer' 
        });
    }
    
    res.json({
        success: true,
        page: 'ADMIN_PANEL',
        title: 'Admin Panel',
        
        navigation: [
            { id: 'delete_user', title: 'Delete User', icon: '🗑️' },
            { id: 'create_account', title: 'Create Account', icon: '👤' },
            { id: 'user_list', title: 'User List', icon: '📋' }
        ],
        
        deleteUserSection: {
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
        
        createAccountSection: {
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
        
        userListSection: {
            title: 'User List',
            filter: {
                label: 'Filter by Role:',
                options: [
                    { value: 'all', label: 'ALL' },
                    { value: 'member', label: 'MEMBER' },
                    { value: 'vip', label: 'VIP' },
                    { value: 'reseller', label: 'RESELLER' },
                    { value: 'owner', label: 'OWNER' },
                    { value: 'partner', label: 'PARTNER' },
                    { value: 'developer', label: 'DEVELOPER' }
                ],
                default: 'all'
            },
            columns: ['Username', 'Role', 'Expired', 'Parent', 'Actions'],
            endpoint: '/admin/userList',
            actions: [
                { 
                    type: 'delete', 
                    icon: '🗑️', 
                    color: 'red', 
                    endpoint: '/admin/deleteUser',
                    tooltip: 'Delete this user'
                }
            ]
        },
        
        adminInfo: {
            name: admin.username,
            role: admin.role.toUpperCase(),
            permissions: ['create_account', 'delete_user', 'view_all_users']
        }
    });
});

app.post('/admin/createAccount', (req, res) => {
    try {
        const { admin_key, username, password, duration_days, role } = req.body;
        
        console.log('🔍 [ADMIN CREATE] Request:', { admin_key, username, role });
        
        if (!admin_key || !username || !password || !duration_days || !role) {
            return res.json({
                success: false,
                message: "Semua field wajib diisi"
            });
        }
        
        const admin = Object.values(users).find(u => 
            u.key === admin_key && ['owner', 'developer'].includes(u.role)
        );
        
        if (!admin) {
            return res.json({
                success: false,
                message: "Admin tidak valid atau tidak memiliki akses"
            });
        }
        
        if (users[username]) {
            return res.json({
                success: false,
                message: "Username sudah digunakan"
            });
        }
        
        const validRoles = ['member', 'vip', 'reseller', 'partner', 'owner'];
        if (!validRoles.includes(role.toLowerCase())) {
            return res.json({
                success: false,
                message: "Role tidak valid. Pilih: member, vip, reseller, partner, owner"
            });
        }
        
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + parseInt(duration_days));
        const expiredStr = expiredDate.toISOString().split('T')[0];
        
        const roleCoins = {
            'member': 0,
            'vip': 50000,
            'reseller': 100000,
            'partner': 75000,
            'owner': 500000
        };
        
        const userId = "USR" + Date.now() + Math.floor(Math.random() * 1000);
        
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
        
        logs.push({
            type: 'admin_create',
            admin: admin.username,
            created_user: username,
            role: role,
            duration_days: duration_days,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ [ADMIN CREATE] Success:', username);
        
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
        
    } catch (error) {
        console.error('🔥 [ADMIN CREATE] Error:', error);
        res.json({
            success: false,
            message: "Server error: " + error.message
        });
    }
});

app.post('/admin/deleteUser', (req, res) => {
    try {
        const { admin_key, username } = req.body;
        
        console.log('🔍 [ADMIN DELETE] Request:', { admin_key, username });
        
        if (!admin_key || !username) {
            return res.json({
                success: false,
                message: "Username wajib diisi"
            });
        }
        
        const admin = Object.values(users).find(u => 
            u.key === admin_key && ['owner', 'developer'].includes(u.role)
        );
        
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
        
        const protectedUsers = ['developer', 'organ', 'owner1'];
        if (protectedUsers.includes(username)) {
            return res.json({
                success: false,
                message: "Tidak dapat menghapus user utama"
            });
        }
        
        const deletedUser = users[username];
        
        delete users[username];
        
        logs.push({
            type: 'admin_delete',
            admin: admin.username,
            deleted_user: username,
            user_role: deletedUser.role,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ [ADMIN DELETE] Success:', username);
        
        res.json({
            success: true,
            message: `✅ User ${username} deleted permanently!`,
            deleted_user: {
                username: username,
                role: deletedUser.role,
                expired: deletedUser.expired
            }
        });
        
    } catch (error) {
        console.error('🔥 [ADMIN DELETE] Error:', error);
        res.json({
            success: false,
            message: "Server error: " + error.message
        });
    }
});

app.get('/admin/userList', (req, res) => {
    try {
        const { admin_key, filter_role } = req.query;
        
        console.log('🔍 [ADMIN USERLIST] Request:', { admin_key, filter_role });
        
        const admin = Object.values(users).find(u => 
            u.key === admin_key && ['owner', 'developer'].includes(u.role)
        );
        
        if (!admin) {
            return res.json({ 
                success: false, 
                message: 'Akses ditolak. Hanya admin/owner/developer' 
            });
        }
        
        let userList = Object.values(users);
        
        if (filter_role && filter_role !== 'all') {
            userList = userList.filter(user => user.role === filter_role.toLowerCase());
        }
        
        const formattedUsers = userList.map(user => ({
            username: user.username,
            role: user.role.toUpperCase(),
            expired: user.expired,
            parent: user.parent || 'SYSTEM',
            coins: user.coins,
            created_at: user.createdAt || 'N/A',
            can_delete: !['developer', 'organ', 'owner1'].includes(user.username)
        }));
        
        console.log('✅ [ADMIN USERLIST] Success:', formattedUsers.length, 'users');
        
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
        
    } catch (error) {
        console.error('🔥 [ADMIN USERLIST] Error:', error);
        res.json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

// ==================== OTHER ENDPOINTS (SIMPLIFIED) ====================
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
        expired: u.expired,
        createdBy: u.createdBy,
        key: u.key,
        parent: u.parent
    }));
    
    res.json({ 
        success: true, 
        users: userList 
    });
});

app.post('/dev/addUser', (req, res) => {
    const { key, username, password, role, coins, expired } = req.body;
    
    if (key !== 'dev007dev007dev0') {
        return res.json({ 
            success: false, 
            message: 'Invalid developer key' 
        });
    }
    
    if (users[username]) {
        return res.json({ 
            success: false, 
            message: 'Username already exists' 
        });
    }
    
    let expiredDate = expired || '9999-12-31';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiredDate)) {
        expiredDate = '9999-12-31';
    }
    
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
        createdBy: 'developer',
        parent: 'developer',
        createdAt: new Date().toISOString()
    };
    
    res.json({
        success: true,
        message: `✅ User ${username} created with role ${role}`,
        user: users[username]
    });
});

app.get('/test', (req, res) => {
    res.json({
        status: 'success',
        message: '🚀 CYBERENG SERVER v4.0 is RUNNING!',
        repository: 'github.com/vanboy666/bug-wa-server',
        total_users: Object.keys(users).length,
        total_endpoints: 20,
        timestamp: new Date().toISOString()
    });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 CYBERENG-SERVER v4.0 - FULL FEATURES              ║
║    Port: ${PORT}                                             ║
║    Owner: ORGAN_GANTENG                                 ║
║    Status: ONLINE                                       ║
║    Repo: github.com/vanboy666/bug-wa-server            ║
╚══════════════════════════════════════════════════════════╝

📊 SYSTEM INFO:
   • Total Users: ${Object.keys(users).length}
   • Available Roles: developer, owner, reseller, member
   • Server Time: ${new Date().toISOString()}

🔧 AVAILABLE ENDPOINTS:
   • POST /validate       - User authentication
   • GET  /myinfo         - User information
   • GET  /seller/dashboard - Seller interface
   • POST /seller/createAccount - Create account
   • POST /seller/extendAccount - Extend account
   • GET  /admin/dashboard - Admin panel
   • POST /admin/createAccount - Admin create account
   • POST /admin/deleteUser - Delete user
   • GET  /admin/userList - User list
   • GET  /dev/users      - Developer endpoint
   • POST /dev/addUser    - Add user
   • GET  /test           - Test endpoint

✅ TEST CREDENTIALS:
   • Username: organ
   • Password: organ123
   • Key: 677890
   • Role: owner

   • Username: developer
   • Password: dev2024
   • Key: dev007dev007dev0
   • Role: developer

🌐 Server URL: http://localhost:${PORT}
📡 Railway: https://bug-wa-serveren.up.railway.app/

✨ Server started successfully! Visit: github.com/vanboy666/bug-wa-server
    `);
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            '/', '/validate', '/myinfo', '/test',
            '/seller/dashboard', '/seller/createAccount', '/seller/extendAccount',
            '/admin/dashboard', '/admin/createAccount', '/admin/deleteUser', '/admin/userList',
            '/dev/users', '/dev/addUser'
        ]
    });
});

app.use((err, req, res, next) => {
    console.error('🔥 [SERVER ERROR]:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});
