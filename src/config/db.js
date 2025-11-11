const mongoose = require('mongoose');
// If you want to run without a real MongoDB (development), this module will
// automatically start an in-memory MongoDB instance when no `mongoUri` is provided.
// Install the memory server if you need it:
// npm install mongodb-memory-server --save

let mongod = null;

const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) {
      // lazy-load to avoid adding the dep unless needed
      const { MongoMemoryServer } = require('mongodb-memory-server')
      console.log('MONGO_URI not provided — starting in-memory MongoDB for development')
      mongod = await MongoMemoryServer.create()
      mongoUri = mongod.getUri()
    }

    // connect with reasonable defaults
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

const stopDB = async () => {
  try {
    await mongoose.disconnect()
    if (mongod) await mongod.stop()
  } catch (err) {
    console.warn('Error stopping DB', err.message)
  }
}

// export connect function; stop available as a property
module.exports = connectDB
module.exports.stop = stopDB
