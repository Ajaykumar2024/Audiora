require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRoutes = require('./routes/auth.routes.js')
const musicRoutes = require('./routes/music.routes.js')
const albumRoutes = require('./routes/album.routes.js')
const searchRoutes = require('./routes/search.routes.js')

const app = express()
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({
    origin: frontendOrigin,
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/music', musicRoutes)
app.use('/api/album', albumRoutes)
app.use('/api/search', searchRoutes)

module.exports = app