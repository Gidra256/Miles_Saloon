const mysql = require('mysql2');
const config = require('../config/config');
const logger = require('./logger');

const pool = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    port: config.database.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

const database = {
    /**
     * Execute a SQL query
     * @param {string} sql - The SQL query to execute
     * @param {Array} params - The parameters for the SQL query
     * @returns {Promise} - Resolves with the query results
     */
    query: async (sql, params = []) => {
        try {
            const [rows] = await promisePool.execute(sql, params);
            return rows;
        } catch (error) {
            logger.error('Database query error:', error);
            throw error;
        }
    },

    /**
     * Test database connection
     * @returns {Promise<boolean>} - Resolves with true if connection is successful
     */
    testConnection: async () => {
        try {
            await promisePool.query('SELECT 1');
            logger.info('Database connection successful');
            return true;
        } catch (error) {
            logger.error('Database connection error:', error);
            throw error;
        }
    },

    /**
     * Close all connections in the pool
     * @returns {Promise} - Resolves when all connections are closed
     */
    close: () => {
        return new Promise((resolve, reject) => {
            pool.end(err => {
                if (err) {
                    logger.error('Error closing database connections:', err);
                    reject(err);
                    return;
                }
                logger.info('All database connections closed');
                resolve();
            });
        });
    }
};

module.exports = database; 