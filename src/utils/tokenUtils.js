const jwt = require('jsonwebtoken')



const tokenUtils = {
    generateToken: (user, tokenLife) => {
        const payload = {
            id: user.user.id,
            email: user.user.email,
            role: user.role
        }
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
    },

    generateRefreshToken: (user) => {
        const payload = {
            id: user.user.id,
            email: user.user.email,
            role: user.role
        }
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
    },


}
module.exports = tokenUtils;