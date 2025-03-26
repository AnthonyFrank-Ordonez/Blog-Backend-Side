const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controller/blogs')
const usersRouter = require('./controller/users')
const loginRouter = require('./controller/login')
const middlewares = require('./utils/middleware')

// Connect to MONGODB
mongoose.set('strictQuery', false)

logger.info('Connecting to MONGODB, please wait....')

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MONGODB')
  })
  .catch((error) => {
    logger.error('Error connecting to MONGODB', error.message)
  })

// Middlewares
app.use(cors())
app.use(express.json())

// token extractor route
app.use(middlewares.tokenExtractor)

// Routes
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controller/testing')
  app.use('/api/testing', testingRouter)
}

// Middlewares
app.use(middlewares.requestLogger)
app.use(middlewares.unknownEndpoint)
app.use(middlewares.errorHandler)

// Start the server
module.exports = app
