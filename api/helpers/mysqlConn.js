const mysql = require('mysql2/promise');
const mysqlConfig = require('../config/mysql.config');

const createMysqlConn = async () => {
    try {
        const conn = await mysql.createConnection({
            multipleStatements: true,
            host: mysqlConfig.config.host,
            port: mysqlConfig.config.port,
            user: mysqlConfig.config.user,
            password: mysqlConfig.config.password,
            database: mysqlConfig.config.database,
        });

        console.log('Connected to the database');
        return conn;
    } catch (error) {
        console.error('Error in getConn: ' + error.message);
        return null;
    }
};

const createMysqlPool = async () => {
    try {
        const conn = mysql.createPool({
            multipleStatements: true,
            host: mysqlConfig.config.host,
            port: mysqlConfig.config.port,
            user: mysqlConfig.config.user,
            password: mysqlConfig.config.password,
            database: mysqlConfig.config.database,
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
            idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });

        console.log('Connected to the database');
        return conn;
    } catch (error) {
        console.error('Error in getConn: ' + error.message);
        return null;
    }
};


const sqlQuery = async (conn, sql, params) => {
    try {
        // const conn = await createMysqlConn();
        // const conn = await createMysqlPool();
        const [results,] = await conn.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error in query:', error);
        // return error;
        throw error.sqlMessage; // Rethrow the error to be handled by the caller
    }
};

const closeSqlConn = async (conn) => {
    // Don't forget to release the connection when finished!
    if (conn?.connection?.connectionId) {
        console.log("closeSqlConn 0 .... ", conn.connection.connectionId)
        conn.end();
    }
}

module.exports = {
    createMysqlConn,
    createMysqlPool,
    closeSqlConn,
    sqlQuery,
}