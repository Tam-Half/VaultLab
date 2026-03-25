const jwt = require('jsonwebtoken')



const authVerify = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);

        req.user = decoded;

        next();

    });
};

module.exports = authVerify;