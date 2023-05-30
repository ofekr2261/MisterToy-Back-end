const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

const logger = require('./services/logger.service')

const app = express()
const http = require('http').createServer(app)

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

// Our server's routes (end points) - grouped by feature:

const authRoutes = require('./api/auth/auth.routes')
app.use('/api/auth', authRoutes)

const userRoutes = require('./api/user/user.routes')
app.use('/api/user', userRoutes)

const reviewRoutes = require('./api/review/review.routes')
app.use('/api/review', reviewRoutes)

const toyRoutes = require('./api/toy/toy.routes')
app.use('/api/toy', toyRoutes)

// Create a fallback route:
// Make every request for which there is no end point match the index.html
// so when requesting http://localhost:3030/index.html/car/123
// it will still respond withour SPA (single page app - the index.html file)
// and allow the frontend router to take it from there

app.get('/**', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const port = process.env.PORT || 3030

http.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})
