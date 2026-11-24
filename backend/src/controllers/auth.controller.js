const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
}

async function registerUser(req, res) {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    const role = req.body?.role === undefined ? 'listener' : req.body.role

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' })
    }

    if (role !== 'listener' && role !== 'artist') {
        return res.status(400).json({ message: 'Role must be either listener or artist.' })
    }

    if (!process.env.JWT_SECRET) {
        console.error('Registration failed: JWT_SECRET is not configured.')
        return res.status(500).json({ message: 'Authentication is not configured.' })
    }

    try {
        const isUserExist = await userModel.findOne({
            $or: [
                { username }, 
                { email }
            ],
        })

        if (isUserExist) {
            return res.status(409).json({ message: 'Username or email is already in use.' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            role,
        })
        const token = jwt.sign({ id: user._id, role: user.role },
             process.env.JWT_SECRET
            ,{ expiresIn: '7d' } // Expires in 7 days
        )

        res.cookie('token', token, cookieOptions)
        return res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        })
    } catch (error) {
        console.error('Registration failed:', error)
        return res.status(500).json({ message: 'Unable to create account. Please try again.' })
    }
}

async function loginUser(req, res) {
    
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''

    if ((!email && !username) || !password) {
        return res.status(400).json({ message: 'Email or username and password are required.' })
    }

    if (!process.env.JWT_SECRET) {
        console.error('Login failed: JWT_SECRET is not configured.')
        return res.status(500).json({ message: 'Authentication is not configured.' })
    }

    try {
        const user = await userModel.findOne(
            { $or: [
                { email },
                 { username }
                ]
             })
            .select('+password')

        if (!user) {
            return res.status(401).json({ message: 'Invalid email/username or password.' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid  password.' })
        }

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Expires in 7 days
        )

        res.cookie('token', token, cookieOptions)
        
        return res.status(200).json({
            message: 'User logged in successfully.',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        })
    } catch (error) {
        console.error('Login failed:', error)
        return res.status(500).json({ message: 'Unable to log in. Please try again.' })
    }
}

function logoutUser(req, res) {
    res.clearCookie('token', cookieOptions)
    return res.status(200).json({ message: 'User logged out successfully.' })
}

async function getMe(req, res) {
    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ message: 'Not logged in.' })
    }

    if (!process.env.JWT_SECRET) {
        console.error('Session lookup failed: JWT_SECRET is not configured.')
        return res.status(500).json({ message: 'Authentication is not configured.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id).select('-password')

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized.' })
        }

        return res.status(200).json({
            message: 'User details fetched successfully.',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        })
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'CastError') {
            return res.status(401).json({ message: 'Unauthorized.' })
        }

        console.error('Session lookup failed:', error)
        return res.status(500).json({ message: 'Unable to fetch user details.' })
    }
}

module.exports = { registerUser, loginUser, logoutUser, getMe }
