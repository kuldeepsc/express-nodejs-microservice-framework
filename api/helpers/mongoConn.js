const {mongoose} = require('mongoose');
const mongoConfig = require('../config/mongo.config');

const createMongoConn = async () => {
    try {
        // Connection URL
        const url = `mongodb://${mongoConfig.config.host}:${mongoConfig.config.port}/${mongoConfig.config.database}`;
        // Connect to MongoDB
        await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Connected to MongoDB');
        return mongoose.connection;

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.stack);
        // throw error;
        return false;
    }
};

const closeMongoConn = async () => {

    // Close the MongoDB connection
    mongoose.connection.close()
        .then(() => {
            console.log('MongoDB connection closed');
        })
        .catch((error) => {
            console.error('Error closing MongoDB connection:', error);
        });

}

module.exports = {
    createMongoConn,
    closeMongoConn
}