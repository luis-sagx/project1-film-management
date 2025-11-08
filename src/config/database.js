const mongoose = require('mongoose');

/**
 * Conecta a MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Cierra la conexión a MongoDB (útil para tests)
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error closing connection: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
