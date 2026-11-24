require('dotenv').config()

const app = require('./src/app')
const connectDB = require('./src/db/db')
const port = Number(process.env.PORT) || 3000

connectDB()
    .then(() => {
        console.log('Connected to database.')

        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}.`)
        })

        server.on('error', (error) => {
            console.error('HTTP server failed to listen:', error.message)
            process.exit(1)
        })
    })
    .catch((error) => {
        console.error('Database connection failed:', error.message)
        process.exit(1)
    })