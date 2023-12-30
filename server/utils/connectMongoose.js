 
const mongoose = require('mongoose')

const { mongoUrl } = require('./config')

const options = {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // autoIndex: true,
  // reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  // reconnectInterval: 500, // Reconnect every 500ms
  // bufferMaxEntries: 0,
  // connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // server: { auto_reconnect: true }
}

// ms: milliseconds
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let mongooseConnecting = false

// const connectMongoose = async () => {
//   mongooseConnecting = true
//   console.log('connecting to MongoDB')
  
//   // Keep trying to connect as long as the app is disconnected from mongoDB
//   while (mongoose.connection.readyState === 0) {
    
//     await mongoose
//       .connect(mongoUrl, options)
//       .then(() => console.log('connected to databases', mongoUrl))
//       .catch(err => console.log('connecting to MongoDB failed', err))
  
//     await sleep(5000)
//   }
  
//   mongooseConnecting = false
// }

// mongoose.connection.on('disconnected', () => {
//   console.log('mongoose.connection disconnected event ran')
  
//   if (!mongooseConnecting) connectMongoose()
// })

const connectMongoose = async () => {
  console.log('connecting to MongoDB')
  
  // Keep trying to connect as long as the app is disconnected from mongoDB
  await mongoose
    .connect(mongoUrl, options)
    .then(() => console.log('connected to databases', mongoUrl))
    .catch(err => console.log('connecting to MongoDB failed', err))
}

mongoose.set('strictQuery', true)

module.exports = connectMongoose
