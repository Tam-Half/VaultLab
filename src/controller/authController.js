const AuthService = require('../services/authService')

const AuthController = {
    loginController: async (req, res) => {
        const { email, password } = req.body;
        try {
            const token = await AuthService.login(email, password);
            res.json(token);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    refreshToken: async (req, res, next) => {
        const refreshToken = req.body.token
        try {
            const accessToken = await AuthService.refreshToken(refreshToken)
            res.json({ accessToken });
        } catch (err) {
            console.log(`error`, err)
        }
    }
}


module.exports = AuthController;