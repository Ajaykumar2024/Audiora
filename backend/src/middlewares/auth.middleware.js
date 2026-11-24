const jwt = require('jsonwebtoken')


//middleware
// async function authArtist(req,res,next){

// }


async function authUser(req, res, next) {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.role !== 'listner') {
            return res.status(403).json({ message: "You don't have access " })
        }

        req.user = decoded

        next()
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized",
        })

    }
}


//auth arist
async function authArtist(req, res, next) {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.role !== 'artist') {
            return res.status(403).json({ message: "forbidden: Artist can only access " })
        }

        req.user = decoded

        next()
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized",
        })
    }
}

module.exports = { authUser, authArtist }
