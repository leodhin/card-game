require('dotenv').config();
module.exports = {
    MONGODB_URI: process.env.MONGODB_URI,
    SERVER_PORT: process.env.SERVER_PORT,
    SESSION_SECRET: process.env.SESSION_SECRET
};