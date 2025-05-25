require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'miles_salon',
        port: process.env.DB_PORT || 3306
    },
    session: {
        secret: process.env.SESSION_SECRET || 'miles-salon-secret-key',
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },
    admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
    },
    ssl: {
        key: process.env.SSL_KEY_PATH,
        cert: process.env.SSL_CERT_PATH
    }
};

module.exports = config; 