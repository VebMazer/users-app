// npm imports
const path = require('path')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

// local imports
const middlewares = require('./middleware/middleware')
const logger = require('./middleware/logger')
const { requestLogger, unknownEndpoint, errorHandler
      } = require('./middleware/middleware')

// Sets up database connection management logic and starts the connection.
const connectMongoose = require('./connectMongoose')

// Router imports
const userRouter          = require('./controllers/userRouter')
const authorizeRouter     = require('./controllers/authorizeRouter')
const authenticateRouter  = require('./controllers/authenticateRouter')
const passwordResetRouter = require('./controllers/passwordResetRouter')
const appRouter           = require('./controllers/appRouter')

const app = express()

// Connect to database.
connectMongoose()

// Middleware that needs to be added before routes are defined.
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('build'))
app.use(requestLogger)

// Api information message. We could add some instructions here.
app.get('/api', (req, res) => {
  res.send('<h1>Backend API starts here</h1> ')
})

// Add routers.
app.use('/api/users',        userRouter)
app.use('/api/apps',         appRouter)
app.use('/api/authorize',    authorizeRouter)
app.use('/api/authenticate', authenticateRouter)
app.use('/api/reset',        passwordResetRouter)

// Middleware that needs to be added after the routes are defined.
app.use('/api/*', unknownEndpoint)
app.use(errorHandler)

// Directs requests that dont match any of the routes previously
// defined to the frontend.
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname+'/build/index.html'));
})

// Close database connection when the app closes.
app.on('close', () => {
  mongoose.connection.close()
})

module.exports = app