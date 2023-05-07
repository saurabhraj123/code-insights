import mongoose from 'mongoose';

let connection;

async function connect() {
    if (connection) {
        console.log('already connected');
        return;
    }

    const db = await mongoose.connect(process.env.MONGODB_URL);
    console.log('new connection');
    connection = db.connection;
}

async function disconnect() {
    if (connection) {
        if (process.env.NODE_ENV == 'production') {
            await mongoose.disconnect();
            connection = null;
        } else {
            console.log('not disconnected');
        }
    }
}

const db = { connect, disconnect };
module.exports = db;
